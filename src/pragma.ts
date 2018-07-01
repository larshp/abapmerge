import FileList from "./file_list";
import File from "./file";

export default class Pragma {
  private static files: FileList;

  public static handle(files: FileList): FileList {
    this.files = files;
    return this.processFiles(files);
  }

  private static processFiles(files: FileList): FileList {
    let result = new FileList();

    for (let i = 0; i < files.length(); i++) {
      let file = files.get(i);

      let lines = file.getContents().split("\n").map(j => j.replace("\r", ""));
      let output = "";
      for (let line of lines) {
        let pragma = line.match(/^(\*|(\s*)")\s*@@abapmerge\s+(.+)/i);
        if (pragma) {
          let indent = (pragma[1] === "*") ? "" : pragma[2];
          let presult = this.processPragma(indent, pragma[3]);
          if (presult) {
            output += presult + "\n";
          } else {
            output += line + "\n";
          }
        } else {
          output = output + line + "\n";
        }
      }

      result.push(new File(file.getFilename(), output));
    }

    return result;
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge Pragma - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
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

}
