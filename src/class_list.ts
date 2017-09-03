import File from "./file";

export default class ClassList {
  private deferred: string;
  private definitions: string;
  private implementations: string;

  public constructor() {
    this.deferred = "";
    this.definitions = "";
    this.implementations = "";
  }

  public push(f: File): void {
    let match = f.getContents().match(/^((.|\n)*ENDCLASS\.)\s*(CLASS(.|\n)*)$/i);
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw "error parsing class: " + f.getFilename();
    }
    let name = f.getFilename().split(".")[0];
    this.deferred = this.deferred + "CLASS " + name + " DEFINITION DEFERRED.\n";
    this.definitions = this.definitions + this.removePublic(name, match[1]) + "\n";
    this.implementations = this.implementations + match[3] + "\n";
  }

  public getResult(): string {
    return this.deferred + this.definitions + this.implementations;
  }

  public getDeferred(): string {
    return this.deferred;
  }

  public getDefinitions(): string {
    return this.definitions;
  }

  public getImplementations(): string {
    return this.implementations;
  }

  private removePublic(name: string, s: string): string {
    let reg = new RegExp("CLASS\\s+" + name + "\\s+DEFINITION\\s+PUBLIC", "i");
    return s.replace(reg, "CLASS " + name + " DEFINITION");
  }
}
