import File from "./file";

export default class FileList implements Iterable<File> {
  private files: File[];

  public constructor(files?: File[]) {
    this.files = files
      ? [].concat(files)
      : [];
  }

  public push(f: File) {
    this.files.push(f);
  }

  public concat(f: FileList) {
    this.files.push(...f.files);
  }

  public length(): number {
    return this.files.length;
  }

  public get(i: number): File {
    return this.files[i];
  }

  public fileByName(name: string): File {
    name = name.toLowerCase();
    const file = this.files.find(f => f.getName().toLowerCase() === name.toLowerCase() && f.isABAP());
    if (file) {
      file.markUsed();
      return file;
    }

    throw Error(`file not found: ${name}`);
  }

  public otherByName(name: string): File {
    name = name.toLowerCase();
    const file = this.files.find(f => f.getFilename().toLowerCase() === name.toLowerCase() && !f.isABAP());
    if (file) {
      file.markUsed();
      return file;
    }

    throw Error(`file not found: ${name}`);
  }

  public validateAllFilesUsed(): void {
    const unusedFiles = this.files
      .filter(i => !i.wasUsed() && (i.isABAP() && !i.isMain()))
      .map(i => i.getFilename().toLowerCase())
      .join(", ");

    if (unusedFiles) {
      throw Error(`Not all files used: [${unusedFiles}]`);
    }
  }

  public [Symbol.iterator](): IterableIterator<File> {
    return this.files[Symbol.iterator]();
  }
}
