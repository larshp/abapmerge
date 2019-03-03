import FileList from "./file_list";
import File from "./file";

export interface IPragmaOpts {
  noComments?: boolean;
}

export default class PragmaProcessor {
  private files: FileList;
  private opts: IPragmaOpts;

  public static process(files: FileList, opts?: IPragmaOpts): FileList {
    const instance = new PragmaProcessor(files, opts);
    return instance.processFiles();
  }

  constructor(files: FileList, opts?: IPragmaOpts) {
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
      let output = [];

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
        "* abapmerge Pragma - " + name.toUpperCase(),
        "****************************************************",
      ];
  }

  private processPragma(indent: string, pragma: string): string[] {

    /* Pragmas has the following format
     * @@abapmerge command params
     * if written as " comment, then indentation before " is also used for output
     * Currently supported pragmas:
     * - include {filename} > {string wrapper}
     *      {filename} - path to the file relative to script execution dir (argv[0])
     *      {string wrapper} is a pattern where $$ is replaced by the include line
     *      $$ is escaped - ' replaced to '' (to fit in abap string), use $$$ to avoid escaping
     *      e.g. include somestyle.css > APPEND '$$' TO styletab.
     */

    let result = [];
    const cmdMatch = pragma.match(/(\S+)\s+(.*)/);
    const command = cmdMatch[1].toLowerCase();
    const commandParams = cmdMatch[2];

    switch (command) {
      case "include":
        result.push(...this.pragmaInclude(indent, commandParams));
        break;
      case "include-base64":
        result.push(...this.pragmaIncludeBase64(indent, commandParams));
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

    const result = [];
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
    if (lines.length === 0) return [];

    return [
      ...this.comment(filename),
      ...lines.map(line => indent + template.replace(/\${2,3}/, line)),
    ];
  }

}
