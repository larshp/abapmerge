import FileList from "./file_list";
import Pragma from "./pragma";
import ClassList from "./class_list";

export default class Merge {
  private static files: FileList;
  private static classes: ClassList;
  private static classesHandled: boolean;

  public static merge(files: FileList, main: string): string {
    this.classesHandled = false;
    this.files = Pragma.handle(files);
    this.classes = new ClassList(this.files);
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
      if (include) {
        if (this.classesHandled === false) {
// global classes are placed before the first INCLUDE
          output = output + this.classes.getResult();
          this.classesHandled = true;
        }
        output = output +
          this.comment(include[1]) +
          this.analyze(this.files.fileByName(include[1])) +
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
