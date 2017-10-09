import File from "./file";

export default class ClassList {
  private deferred: string;
  private exceptions: string;
  private definitions: string;
  private implementations: string;

  public constructor() {
    this.exceptions = "";
    this.deferred = "";
    this.definitions = "";
    this.implementations = "";
  }

  public push(f: File): void {
    let match = f.getContents().match(/^((.|\s)*ENDCLASS\.)\s*(CLASS(.|\s)*)$/i);
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw "error parsing class: " + f.getFilename();
    }
    let name = f.getFilename().split(".")[0];
    let def = this.removePublic(name, match[1]);

    if (name.match(/^.?CX_/i)) {
// the DEFINITION DEFERRED does not work very well for exception classes
      this.exceptions = this.exceptions + def + "\n" + match[3] + "\n";
    } else {
      this.deferred = this.deferred + "CLASS " + name + " DEFINITION DEFERRED.\n";
      this.definitions = this.definitions + def + "\n";
      this.implementations = this.implementations + match[3] + "\n";
    }
  }

  public getResult(): string {
    return this.exceptions +
      this.deferred +
      this.definitions +
      this.implementations;
  }

  public getDeferred(): string {
    return this.deferred;
  }

  public getDefinitions(): string {
    return this.definitions;
  }

  public getExceptions(): string {
    return this.exceptions;
  }

  public getImplementations(): string {
    return this.implementations;
  }

  private removePublic(name: string, s: string): string {
    let reg = new RegExp("CLASS\\s+" + name + "\\s+DEFINITION\\s+PUBLIC", "i");
    return s.replace(reg, "CLASS " + name + " DEFINITION");
  }
}
