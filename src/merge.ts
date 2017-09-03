//import File from "./file";
import FileList from "./file_list";

export default class Merge {
  private static files: FileList;
//  private static classes: ClassList;

  public static merge(files: FileList, main: string): string {
    this.files = files;
//    this.classes = new ClassList();
    let result = this.analyze(this.files.fileByName(main));
    this.files.checkFiles();
    return this.appendTimestamp(result);
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
      if (!include) {
// try namespaced
        include = line.match(/^\s*INCLUDE\s+(\/\w+\/\w+)\s*\.\s*.*$/i);
        if (include) {
          include[1] = include[1].replace(/\//g, "#");
        }
      }
      let pragma  = line.match(/^(\*|(\s*)")\s*@@abapmerge\s+(.+)/i);
      if (include) {
        output = output +
          this.comment(include[1]) +
          this.analyze(this.files.fileByName(include[1])) +
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

        let lines = this.files.otherByName(params[1])
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

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }
}
