import FileList from "./file_list";
import Pragma from "./pragma";
import ClassList from "./class_list";

export default class Merge {
  private static files: FileList;
  private static classes: ClassList;

  public static merge(files: FileList, main: string, options?: {skipFUGR: boolean}): string {
    this.files = files;

    if (options && options.skipFUGR) {
      this.files = this.skipFUGR(this.files);
    }
    this.files = Pragma.handle(this.files);
    this.classes = new ClassList(this.files);
    let result = this.analyze(main, this.files.fileByName(main));
    this.files.checkFiles();
    return this.appendFooter(result);
  }

  private static skipFUGR(files: FileList): FileList {
    let result = new FileList();

    for (let i = 0; i < files.length(); i++) {
      let file = files.get(i);
      if (file.getFilename().match(/\.fugr\./) ) {
        continue;
      }
      result.push(file);
    }

    return result;
  }

  private static appendFooter(contents: string) {
    return contents +
      "****************************************************\n" +
      "INTERFACE lif_abapmerge_marker.\n" +
      "ENDINTERFACE.\n" +
      "****************************************************\n" +
      "* abapmerge " + process.env.npm_package_version + " - " + new Date().toJSON() + "\n" +
      "****************************************************\n";
  }

  private static analyze(main: string, contents: string) {
    let output = "";
    let lines = contents.split("\n").map(i => i.replace("\r", ""));

    let lineNo = 0;
    if (main !== null) {
      while (lineNo < lines.length) {
        let line = lines[lineNo++];
        output += line + "\n";

        let report = line.match(/^\s*REPORT\s+(\w+)(\s+[^.*]*\.|\s*\.)$/im);
        if (report && (report[1].toLowerCase() === main.toLowerCase())) {
          break;
        }
      }

      while (lineNo < lines.length) {
        let line = lines[lineNo];

        if (!line.match(/^((\*.*)|(\s*))$/im)) {
          output += this.classes.getResult();
          break;
        }

        output += line + "\n";
        ++lineNo;
      }
    }

    for ( ; lineNo < lines.length; ++lineNo) {
      let line = lines[lineNo];
      let include = line.match(/^\s*INCLUDE\s+(z\w+)\s*\.\s*.*$/i);
      if (!include) {
// try namespaced
        include = line.match(/^\s*INCLUDE\s+(\/\w+\/\w+)\s*\.\s*.*$/i);
        if (include) {
          include[1] = include[1].replace(/\//g, "#");
        }
      }
      if (include) {
        output = output +
          this.comment(include[1]) +
          this.analyze(null, this.files.fileByName(include[1])) +
          "\n";
      } else {
        output = output + line + "\n";
      }
    }

    return output.replace(/\n\n\n/g, "\n");
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }
}
