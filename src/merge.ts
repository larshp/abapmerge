import File from "./file";

export default class Merge {
  private static files: File[];
  private static used: number;

  public static merge(files: File[], main: string): string {
    this.files = files;
    this.used = 0;
    return this.analyze(this.fileByName(main));
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

  private static analyze(contents: string) {
    let output = "";
    let lines = contents.split("\n");

    for (let line of lines) {
      let include = line.match(/^\s?INCLUDE\s+(\w+)\s?.$/);
      if (include) {
        output = output +
          this.comment(include[1]) +
          this.fileByName(include[1]) +
          "\n";
      } else {
        output = output + line + "\n";
      }
    }

// just comparing the length is not completely correct, but it will work for now
    if (this.used !== this.files.length) {
      throw "not all files used";
    }

    return output;
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
      "* abapmerge - " + name.toUpperCase() + "\n" +
      "****************************************************\n";
  }
}
