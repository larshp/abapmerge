import File from "./file";
import FileList from "./file_list";
import Class from "./class";
import Graph from "./graph";
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
    return this.getExceptions() +
      this.getDeferred() +
      this.getInterfaces() +
      this.getDefinitions() +
      this.getImplementations();
  }

  public getDeferred(): string {
    let classes = this.classes.reduce((a, c) => "CLASS " + c.getName() + " DEFINITION DEFERRED.\n" + a, "");
    let interfaces = this.interfaces.reduce((a, c) => "INTERFACE " + c.getName() + " DEFERRED.\n" + a, "");
    return interfaces + classes;
  }

  public getImplementations(): string {
    return this.classes.reduce((a, c) => c.getImplementation() + "\n" + a, "");
  }

  public getDefinitions(): string {
    let g = this.buildDependenciesGraph(this.classes);

    let result = "";
    while (g.countNodes() > 0) {
      let leaf = g.popLeaf();
      result = result + leaf.getDefinition() + "\n";
    }

    return result;
  }

  public getExceptions(): string {
    let g = this.buildDependenciesGraph(this.exceptions);

    let result = "";
    while (g.countNodes() > 0) {
      let leaf = g.popLeaf();
      result = result + leaf.getDefinition() + "\n" + leaf.getImplementation() + "\n";
    }

    return result;
  }

  public getInterfaces(): string {
    let g = this.buildDependenciesGraph(this.interfaces);

    let result = "";
    while (g.countNodes() > 0) {
      let leaf = g.popLeaf();
      result = result + leaf.getDefinition() + "\n";
    }

    return result;
  }

  private buildDependenciesGraph(list: Class[]): Graph<Class> {
    let g = new Graph<Class>();

    list.forEach((c) => {
      g.addNode(c.getName(), c);
      c.getDependencies().forEach((d) => g.addEdge(c.getName(), d) );
    });

    return g;
  }

  private parseFiles(list: FileList) {
    for (let i = 0; i < list.length(); i++) {
      let f = list.get(i);
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
    let cls = ClassParser.parse(f, list);
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
