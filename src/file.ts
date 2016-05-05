export default class File {
  private name: string;
  private contents: string;

  public constructor(n: string, c: string) {
    this.name = n;
    this.contents = c;
  }

  public getName(): string {
    return this.name;
  }

  public getContents(): string {
    return this.contents;
  }
}
