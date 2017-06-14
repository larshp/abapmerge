export default class File {
  private filename: string;
  private contents: string;
  private isUsed: boolean;

  public constructor(filename: string, c: string) {
    this.filename = filename;
    this.contents = c;
    this.isUsed   = false;
  }

  public getName(): string {
    return this.filename.split(".")[0];
  }

  public getContents(): string {
    return this.contents;
  }

  public wasUsed(): boolean {
    return this.isUsed;
  }

  public markUsed() {
    this.isUsed = true;
  }

  public isABAP() {
    return this.filename.match(/.abap$/) !== null;
  }
}
