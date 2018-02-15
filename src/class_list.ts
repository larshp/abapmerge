import File from "./file";
import FileList from "./file_list";
import Class from "./class";
import Graph from "./graph";

export default class ClassList {
  private interfaces: Class[];
  private classes: Class[];
  private exceptions: Class[];

  public constructor(list: FileList) {
    this.interfaces = [];
    this.classes = [];
    this.exceptions = [];

    this.parseFiles(list);
  }

  public getResult(): string {
    return this.getExceptions() +
      this.getDeferred() +
      this.getInterfaces() +
      this.getDefinitions() +
      this.getImplementations();
  }

  public getDeferred(): string {
    let classes = this.classes.reduce((a, c) => { return "CLASS " + c.getName() + " DEFINITION DEFERRED.\n" + a; }, "");
    let interfaces = this.interfaces.reduce((a, c) => { return "INTERFACE " + c.getName() + " DEFERRED.\n" + a; }, "");
    return interfaces + classes;
  }

  public getDefinitions(): string {
    let g = new Graph<Class>();

    this.classes.forEach((c) => {
      g.addNode(c.getName(), c);
      c.getDependencies().forEach((d) => { g.addEdge(c.getName(), d); } );
    });

    let result = "";
    while (g.countNodes() > 0) {
      let leaf = g.popLeaf();
      result = result + leaf.getDefinition() + "\n";
    }

    return result;
  }

  public getExceptions(): string {
    let g = new Graph<Class>();

    this.exceptions.forEach((c) => {
      g.addNode(c.getName(), c);
      c.getDependencies().forEach((d) => { g.addEdge(c.getName(), d); } );
    });

    let result = "";
    while (g.countNodes() > 0) {
      let leaf = g.popLeaf();
      result = result + leaf.getDefinition() + "\n" + leaf.getImplementation() + "\n";
    }

    return result;
  }

  public getImplementations(): string {
    return this.classes.reduce((a, c) => { return c.getImplementation() + "\n" + a; }, "");
  }

  public getInterfaces(): string {
    return this.interfaces.reduce((a, c) => { return c.getDefinition() + a; }, "");
  }

  private parseFiles(list: FileList) {
    for (let i = 0; i < list.length(); i++) {
      let f = list.get(i);
      if (f.getFilename().match(/\.clas\.abap$/)) {
        f.markUsed();
        this.pushClass(f);
      } else if (f.getFilename().match(/\.clas\.testclasses\.abap$/)) {
        f.markUsed();
      } else if (f.getFilename().match(/\.intf\.abap$/)) {
        f.markUsed();
        this.pushInterface(f);
      }
    }
  }

  private pushClass(f: File): void {
    let match = f.getContents().match(/^(([\s\S])*ENDCLASS\.)\s*(CLASS(.|\s)*)$/i);
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw "error parsing class: " + f.getFilename();
    }
    let name = f.getFilename().split(".")[0];
    let def = this.makeLocal(name, match[1]);

    let superMatch = def.match(/INHERITING FROM (Z\w+)/i);
//    console.dir(superMatch);
    let dependencies = [];
    if (superMatch && superMatch[1]) {
      dependencies.push(superMatch[1].toLowerCase());
    }

    let cls = new Class(name, def, match[3], dependencies);

    if (name.match(/^.?CX_/i)) {
// the DEFINITION DEFERRED does not work very well for exception classes
      this.exceptions.push(cls);
    } else {
      this.classes.push(cls);
    }
  }

  private pushInterface(f: File): void {
    let match = f.getContents().match(/^([\s\S]+) PUBLIC([\s\S]+)$/i);
    if (!match || !match[1] || !match[2]) {
      throw "error parsing interface: " + f.getFilename();
    }
    this.interfaces.push(new Class(f.getFilename().split(".")[0], match[1] + match[2]));
  }

  private makeLocal(name: string, s: string): string {
    let reg1 = new RegExp("CLASS\\s+" + name + "\\s+DEFINITION\\s+PUBLIC", "i");
    let ret = s.replace(reg1, "CLASS " + name + " DEFINITION");
    let reg2 = new RegExp("GLOBAL\\s+FRIENDS\\s+ZCL_ABAPGIT", "i");
    ret = ret.replace(reg2, "FRIENDS ZCL_ABAPGIT");
    return ret;
  }
}
