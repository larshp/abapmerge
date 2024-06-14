import * as path from "path";

type FileContent = string | Buffer;
export default class File {
  private filename: string;
  private dirname: string;
  private contents: FileContent;
  private isUsed: boolean = false;
  private modified: boolean = false;

  // object names are unique across packages in ABAP, so
  // the folder name is not part of this class
  public constructor(filename: string, content: FileContent, modified?: boolean) {
    this.dirname = path.dirname(filename);
    this.filename = path.basename(filename);
    this.contents = content;
    this.modified = modified;
  }

  public isBinary(): boolean {
    return typeof this.contents !== "string";
  }

  public getName(): string {
    return this.filename.split(".")[0];
  }

  public getFilename(): string {
    return this.filename;
  }

  public getFilepath(): string {
    return path.join(this.dirname, this.filename);
  }

  public getContents(): string {
    if (this.isBinary()) throw Error(`Binary file accessed as string [${this.filename}]`);
    return this.contents as string;
  }

  public getBlob(): Buffer {
    if (!this.isBinary()) throw Error(`Text file accessed as blob [${this.filename}]`);
    return this.contents as Buffer;
  }

  public wasUsed(): boolean {
    return this.isUsed;
  }

  public isModified(): boolean {
    return this.modified;
  }

  public markUsed() {
    this.isUsed = true;
  }

  public isABAP(): boolean {
    return this.filename.match(/.abap$/) !== null;
  }

  public isPROG(): boolean {
    return this.filename.match(/prog.abap$/) !== null;
  }

  public isMain(): boolean {
    if (!this.isPROG() || this.isBinary()) {
      return false;
    }

    return !!this.getContents().match(/^(\*|\s*")\s*@@abapmerge\s+main\s+void/i);
  }
}
