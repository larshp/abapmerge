import FileList from "./file_list";
import File from "./file";

export default class Pragma {
  private files: FileList;

  public static process(files: FileList): FileList {
    const instance = new Pragma(files);
    return instance.processFiles();
  }

  constructor(files: FileList) {
    this.files = files;
  }

  private processFiles(): FileList {
    let result = new FileList();

    for (let i = 0; i < this.files.length(); i++) {
      let file = this.files.get(i);

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

  private comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge Pragma - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }

  private processPragma(indent: string, pragma: string) {

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
    const cmdMatch = pragma.match(/(\S+)\s+(.*)/);
    const command = cmdMatch[1].toLowerCase();
    const commandParams = cmdMatch[2];

    switch (command) {
      case "include":
        const params = commandParams.match(/(\S+)\s*>\s*(.*)/i);
        if (!params) { break; }
        const filename = params[1];
        const template = params[2];

        const lines = this.files.otherByName(filename)
          .replace(/\t/g, "  ")
          .replace(/\r/g, "")
          .split("\n");

        if (lines.length > 0 && !lines[lines.length - 1]) {
          lines.pop(); // remove empty string
        }

        result = this.comment(filename);
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
