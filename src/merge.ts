import File from "./file";

export default class Merge {
  private static files: File[];

  public static merge(files: File[], main: string): string {
    this.files = files;
    return this.analyze(this.fileByName(main));
  }

  private static fileByName(name: string): string {
    for (let file of this.files) {
      if (file.getName().toLowerCase() === name.toLowerCase()) {
        return file.getContents();
      }
    }

    throw "file not found: " + name;
  }

  private static analyze(contents: string) {
    let output = "";
    let lines = contents.split("\n");

    for (let line of lines) {
      let include = line.match(/^\s?INCLUDE\s+(\w+)\s?.$/);
      if (include) {
        output = output + this.fileByName(include[1]) + "\n";
      } else {
        output = output + line + "\n";
      }
    }

    return output;
  }
}
