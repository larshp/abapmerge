import FileList from "./file_list";
import File from "./file";
import { XMLParser } from "fast-xml-parser";

export interface IPragmaOpts {
  noComments?: boolean;
}

export default class PragmaProcessor {
  private files: FileList;
  private opts: IPragmaOpts;
  private currentPragmaName: string;

  public static process(files: FileList, opts?: IPragmaOpts): FileList {
    const instance = new PragmaProcessor(files, opts);
    return instance.processFiles();
  }

  public constructor(files: FileList, opts?: IPragmaOpts) {
    this.files = files;
    this.opts = opts || {};
  }

  public processFiles(): FileList {
    let newFiles = new FileList();

    for (const file of this.files) {
      if (file.isBinary() || !file.isABAP()) {
        newFiles.push(file);
        continue;
      }

      let lines = file.getContents().split("\n");
      let hasPragma = false;
      let output: string[] = [];

      for (let line of lines) {
        let pragma = line.match(/^(\*|(\s*)")\s*@@abapmerge\s+(.+)/i);
        if (pragma) {
          const pragmaCmd = pragma[3];
          const indent = (pragma[1] === "*") ? "" : pragma[2];
          const processed = this.processPragma(indent, pragmaCmd);
          if (processed && processed.length > 0) {
            hasPragma = true;
            output.push(...processed);
          } else {
            output.push(line);
          }
        } else {
          output.push(line);
        }
      }

      newFiles.push(hasPragma
        ? new File(file.getFilename(), output.join("\n"))
        : file);
    }

    return newFiles;
  }

  private comment(name: string): string[] {
    return this.opts.noComments
      ? []
      : [
        "****************************************************",
        `* abapmerge Pragma [${this.currentPragmaName}] - ${name.toUpperCase()}`,
        "****************************************************",
      ];
  }

  private processPragma(indent: string, pragma: string): string[] | null {

    /* pragmas has the following format
     * @@abapmerge command params
     * if written as " comment, then indentation before " is also used for output
     * Currently supported pragmas:
     * - include {filename} > {string wrapper}
     *      {filename} - path to the file relative to script execution dir (argv[0])
     *      {string wrapper} is a pattern where $$ is replaced by the include line
     *      $$ is escaped - ' replaced to '' (to fit in abap string), use $$$ to avoid escaping
     *      e.g. include somestyle.css > APPEND '$$' TO styletab.
     * - include-cua { filaname.xml } > { variable }
     *      parse xml file, find CUA node and convert it to `variable`
     *      zcl_abapgit_objects_program=>ty_cua type is expected for the var
     */

    let result: string[] = [];
    const cmdMatch = pragma.match(/(\S+)\s+(.*)/);
    if (!cmdMatch) return null;
    const command = cmdMatch[1].toLowerCase();
    const commandParams = cmdMatch[2];

    this.currentPragmaName = command; // hack for `comment()`
    switch (command) {
      case "include":
        result.push(...this.pragmaInclude(indent, commandParams));
        break;
      case "include-base64":
        result.push(...this.pragmaIncludeBase64(indent, commandParams));
        break;
      case "include-cua":
        result.push(...this.pragmaIncludeCua(indent, commandParams));
        break;

      default: break;
    }

    return result;
  }

  private pragmaInclude(indent: string, includeParams: string): string[] {
    const params = includeParams.match(/(\S+)\s*>\s*(.*)/i);
    if (!params) return [];
    const filename = params[1];
    const template = params[2];

    const lines = this.files.otherByName(filename).getContents().split("\n");
    if (lines.length > 0 && !lines[lines.length - 1]) {
      lines.pop(); // remove empty string
    }

    const result: string[] = [];
    result.push(...this.comment(filename));
    result.push(...lines.map(line => {
      let render = template.replace("$$$", line); // unescaped
      render = render.replace("$$", line.replace(/'/g, "''")); // escape ' -> ''
      return indent + render;
    }));

    return result;
  }

  private pragmaIncludeBase64(indent: string, includeParams: string): string[] {
    const params = includeParams.match(/(\S+)\s*>\s*(.*)/i);
    if (!params) return [];
    const filename = params[1];
    const template = params[2];

    const lines = this.files.otherByName(filename)
      .getBlob()
      .toString("base64")
      .match(/.{1,60}/g);
    if (!lines || lines.length === 0) return [];

    return [
      ...this.comment(filename),
      ...lines.map(line => indent + template.replace(/\${2,3}/, line)),
    ];
  }

  private pragmaIncludeCua(indent: string, includeParams: string): string[] {
    const params = includeParams.trim().match(/(\S+)\s*>\s*(\S+)/i);
    if (!params) return [];
    const filename = params[1];
    const varName = params[2];

    if (!/\.xml$/i.test(filename)) return [];

    const xml = this.files.otherByName(filename).getContents();
    const lines = new CuaConverter().convert(xml, varName);
    if (!lines || lines.length === 0) return [];

    return [
      ...this.comment(filename),
      ...lines.map(i => indent + i),
    ];
  }

}

class CuaConverter {
  public convert(xml: string, varName: string): string[] | null {

    const parser = new XMLParser({
      ignoreAttributes: true,
      numberParseOptions: { leadingZeros: false, hex: true }, // to keep leading zeros
      isArray: (_name, jpath: string, _isLeafNode, _isAttribute) => {
        // single item tables are still arrays (all but ADM branch)
        if (!jpath.startsWith("abapGit.asx:abap.asx:values.CUA.")) return false;
        const path = jpath.split(".");
        if (path.length !== 6) return false;
        if (path[4] === "ADM") return false; // flat structure
        return true;
      },
    });
    const parsed = parser.parse(xml);
    if (!parsed) throw Error("CuaConverter: XML parsing error");
    const cua = parsed?.abapGit?.["asx:abap"]?.["asx:values"]?.CUA;
    if (!cua) return null; // cua is not found - nothing to convert but not an exception

    const defs: string[] = [];
    const code: string[] = [];

    // eslint-disable-next-line guard-for-in
    for (let key in cua) {
      let node = cua[key];
      key = key.toLowerCase();
      if (key === "adm") {
        code.push(...this.fillStruc(`${varName}-adm`, node));
      } else {
        const itemName = `ls_${key}`;
        defs.push(`DATA ${itemName} LIKE LINE OF ${varName}-${key}.`);
        const attrs = Object.keys(node);
        if (attrs.length !== 1) throw Error(`CuaConverter: unexpected structure of [${key}] node`);
        node = node[attrs[0]];
        if (!Array.isArray(node)) throw Error(`CuaConverter: unexpected structure of [${key}/${attrs[0]}] node`);
        for (const itemData of node) {
          code.push(`CLEAR ${itemName}.`);
          code.push(...this.fillStruc(itemName, itemData));
          code.push(`APPEND ${itemName} TO ${varName}-${key}.`);
        }
      }
    }

    return [...defs, ...code];
  }
  private fillStruc(varName: string, obj: object): string[] {
    return [...Object.entries(obj)].map(([key, val]) => `${varName}-${key.toLowerCase()} = '${val}'.`);
  }
}
