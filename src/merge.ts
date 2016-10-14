import File from "./file";
import * as path from "path";
import * as fs from "fs";

export default class Merge {
  private static files: File[];
  private static used: number;

  public static merge(files: File[], main: string): string {
    this.files = files;
    this.used  = 0;
    let result = this.analyze(this.fileByName(main));
    this.checkFiles();
    return this.appendTimestamp(result);
  }

  private static fileByName(name: string): string {
    for (let file of this.files) {
      if (file.getName().toLowerCase() === name.toLowerCase()) {
        this.used++;
        return file.getContents();
      }
    }

    throw "file not found: " + name;
  }

  private static appendTimestamp(contents: string) {
    return contents +
      "****************************************************\n" +
      "* abapmerge - " + new Date().toJSON() + "\n" +
      "****************************************************\n";
  }

  private static analyze(contents: string) {
    let output = "";
    let lines = contents.split("\n");

    for (let line of lines) {
      let include = line.match(/^\s*INCLUDE\s+(z\w+)\s*\.\s*.*$/i);
      let pragma  = line.match(/^(\*|(\s*)")\s*@@abapmerge\s+(.+)/i);
      if (include) {
        output = output +
          this.comment(include[1]) +
          this.analyze(this.fileByName(include[1])) +
          "\n";
      } else if (pragma) {
        let indent = (pragma[1] === "*") ? "" : pragma[2];
        let result = this.processPragma(indent, pragma[3]);
        if (result) {
          output += result + "\n";
        } else {
          output += line + "\n";
        }
      } else {
        output = output + line + "\n";
      }
    }

    return output;
  }

  private static processPragma(indent: string, pragma: string) {

    /* Pragmas has the following format
     * @@abapmerge command params
     * if written as " comment, then indentation before " is also used for output
     * Currently supported pragmas:
     * - include {filename} > {string wrapper}
     *      {filename} - path to the file relative to script execution dir (argv[0])
     *      {string wrapper} is a pattern where $$ is replaced by the include line
     *      e.g. include somestyle.css > APPEND '$$' TO styletab.
     */

    let result = "";
    let cmd    = pragma.match(/(\S+)\s+(.*)/);

    switch (cmd[1].toLowerCase()) {
      case "include":
        let params = pragma.match(/(\S+)\s*>\s*(.*)/i);
        if (!params) { break; }

        let dir      = path.dirname(process.argv[2]); // refactor somewhen
        let fileName = path.join(dir, params[1]);
        if (!fs.existsSync(fileName)) { break; }

        let lines = fs.readFileSync(fileName, "utf8")
          .replace("\t", "  ")
          .split(/\r?\n/);

        if (lines.length > 0 && !lines[lines.length - 1]) {
          lines.pop(); // remove empty string
        }

        result = this.comment(params[1]);
        result += lines
          .map(line => indent + params[2].replace("$$", line))
          .join("\n");

        break;

      default: break;
    }

    return result;
  }

  private static checkFiles(): void {
// just comparing the length is not completely correct, but it will work for now
    if (this.used !== this.files.length) {
      throw "not all files used";
    }
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }
}
