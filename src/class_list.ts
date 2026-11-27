import File from "./file";
import FileList from "./file_list";
import Class from "./class";
import Graph from "./graph";
import Dependencies from "./dependencies";
import InterfaceParser from "./interface_parser";
import { ClassParser } from "./class_parser";

export default class ClassList {
  private interfaces: Class[];
  private classes: Class[];
  private exceptions: Class[];
  private testclasses: Class[];

  public constructor(list: FileList) {
    this.interfaces = [];
    this.classes = [];
    this.exceptions = [];
    this.testclasses = [];

    this.parseFiles(list);
  }

  public getResult(): string {
    return [
      this.getDeferred(),
      this.render(this.ordered()),
      this.getImplementations(),
    ].join("");
  }

  public getDeferred(): string {
    const classes = this.classes.reduce((a, c) => "CLASS " + c.getName() + " DEFINITION DEFERRED.\n" + a, "");
    const interfaces = this.interfaces.reduce((a, c) => "INTERFACE " + c.getName() + " DEFERRED.\n" + a, "");
    return interfaces + classes;
  }

  public getImplementations(): string {
    return this.classes.reduce((a, c) => c.getImplementation() + "\n" + a, "");
  }

  public getDefinitions(): string {
    return this.render(this.ordered().filter(c => this.classes.includes(c)));
  }

  public getExceptions(): string {
    return this.render(this.ordered().filter(c => this.exceptions.includes(c)));
  }

  public getInterfaces(): string {
    return this.render(this.ordered().filter(c => this.interfaces.includes(c)));
  }

  private render(list: Class[]): string {
    let result = "";
    for (const c of list) {
      result = result + c.getDefinition() + "\n";
      if (this.exceptions.includes(c)) {
        // exception classes are not deferred, so they come as a whole
        result = result + c.getImplementation() + "\n";
      }
    }
    return result;
  }

  /**
   * Exceptions, interfaces and classes in one sequence, each after the ones
   * its definition needs. Without such a need the sequence is exceptions,
   * then interfaces, then classes.
   */
  private ordered(): Class[] {
    const all = [...this.exceptions, ...this.interfaces, ...this.classes];
    const known = new Set(all.map(c => ClassList.abapName(c)));
    const g = new Graph<Class>();

    for (const c of all) {
      const name = ClassList.abapName(c);
      g.addNode(name, c);
      const strong = c.getDependencies().map(d => d.toLowerCase());
      for (const d of strong) g.addEdge(name, d);
      // found by a scan of the source, and a definition can name another one
      // without needing it first - so these only order, they never fail
      for (const d of Dependencies.find(name, c.getDefinition(), known)) {
        if (strong.includes(d) === false) g.addWeakEdge(name, d);
      }
    }

    const result: Class[] = [];
    while (g.countNodes() > 0) {
      result.push(g.popLeaf());
    }
    return result;
  }

  /** the name as written in the source: lower case, namespace with slashes */
  private static abapName(c: Class): string {
    return c.getName().toLowerCase().replace(/#/g, "/");
  }

  private parseFiles(list: FileList) {
    for (let i = 0; i < list.length(); i++) {
      const f = list.get(i);
      if (f.getFilename().match(/\.clas\.abap$/)) {
        f.markUsed();
        this.pushClass(f, list);
      } else if (f.getFilename().match(/\.clas\.testclasses\.abap$/)) {
        f.markUsed();
      } else if (f.getFilename().match(/\.intf\.abap$/)) {
        f.markUsed();
        this.pushInterface(f);
      }
    }
    if (this.testclasses.length) {
    // patch after the fact, as we don't know if a class is a test class until we parse it
      const remover = ClassParser.createTestFriendsRemover(this.testclasses);
      this.classes = this.classes.map(remover);
      this.interfaces = this.interfaces.map(remover);
    }
  }

  private pushClass(f: File, list: FileList): void {
    const cls = ClassParser.parse(f, list);
    if (cls.isForTesting() === true) {
      this.testclasses.push(cls);
      return; // skip global test classes
    }
    if (cls.getName().match(/^.?CX_/i)) {
      // the DEFINITION DEFERRED does not work very well for exception classes
      this.exceptions.push(cls);
    } else {
      this.classes.push(cls);
    }
  }

  private pushInterface(f: File): void {
    this.interfaces.push(InterfaceParser.parse(f));
  }
}
