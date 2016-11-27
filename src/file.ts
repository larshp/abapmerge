export default class File {
  private name: string;
  private contents: string;
  private isUsed: boolean;

  public constructor(n: string, c: string) {
    this.name     = n;
    this.contents = c;
    this.isUsed   = false;
  }

  public getName(): string {
    return this.name;
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
}
