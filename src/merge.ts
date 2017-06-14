import File from "./file";

export default class Merge {
  private static files: File[];

  public static merge(files: File[], main: string): string {
    this.files = files;
    let result = this.analyze(this.fileByName(main));
    this.checkFiles();
    return this.appendTimestamp(result);
  }

  private static fileByName(name: string): string {
    for (let file of this.files) {
      if (file.getName().toLowerCase() === name.toLowerCase() && file.isABAP()) {
        file.markUsed();
        return file.getContents();
      }
    }

    throw "file not found: " + name;
  }

  private static otherByName(name: string): string {
    for (let file of this.files) {
      if (file.getFilename().toLowerCase() === name.toLowerCase() && !file.isABAP()) {
        file.markUsed();
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
    let lines = contents.split("\n").map(i => i.replace("\r", ""));

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
     *      $$ is escaped - ' replaced to '' (to fit in abap string), use $$$ to avoid escaping
     *      e.g. include somestyle.css > APPEND '$$' TO styletab.
     */

    let result = "";
    let cmd    = pragma.match(/(\S+)\s+(.*)/);

    switch (cmd[1].toLowerCase()) {
      case "include":
        let params = pragma.match(/(\S+)\s*>\s*(.*)/i);
        if (!params) { break; }

        let lines = this.otherByName(params[1])
          .replace("\t", "  ")
          .split("\n")
          .map(i => i.replace("\r", ""));

        if (lines.length > 0 && !lines[lines.length - 1]) {
          lines.pop(); // remove empty string
        }

        const template = params[2];
        result = this.comment(params[1]);
        result += lines
          .map(line => {
            let render = template.replace("$$$", line); // unescaped
            render = render.replace("$$", line.replace(/'/g, "''")); // escape ' -> ''
            return indent + render;
          })
          .join("\n");

        break;

      default: break;
    }

    return result;
  }

  private static checkFiles(): void {
    const unusedFiles = this.files
      .filter(i => !i.wasUsed() && i.isABAP())
      .map(i => i.getName().toLowerCase())
      .join(", ");

    if (unusedFiles) {
      throw "Not all files used: [" + unusedFiles + "]";
    }
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }
}
