import File from "./file";

export default class FileList {
  private files: File[];

  public constructor(files?: File[]) {
    this.files = [];

    if (files) {
      files.forEach((f) => { this.push(f); });
    }
  }

  public push(f: File) {
    this.files.push(f);
  }

  public concat(f: FileList) {
    this.files = this.files.concat(f.files);
    return this;
  }

  public length(): number {
    return this.files.length;
  }

  public get(i: number): File {
    return this.files[i];
  }

  public fileByName(name: string): string {
    for (let f of this.files) {
      if (f.getName().toLowerCase() === name.toLowerCase() && f.isABAP()) {
        f.markUsed();
        return f.getContents();
      }
    }

    throw "file not found: " + name;
  }

  public otherByName(name: string): string {
    for (let f of this.files) {
      if (f.getFilename().toLowerCase() === name.toLowerCase() && !f.isABAP()) {
        f.markUsed();
        return f.getContents();
      }
    }

    throw "file not found: " + name;
  }

  public checkFiles(): void {
    const unusedFiles = this.files
      .filter(i => !i.wasUsed() && (i.isABAP() && !i.isMain()))
      .map(i => i.getFilename().toLowerCase())
      .join(", ");

    if (unusedFiles) {
      throw "Not all files used: [" + unusedFiles + "]";
    }
  }

}
