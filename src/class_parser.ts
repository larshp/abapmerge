import File from "./file";
import FileList from "./file_list";
import Class from "./class";
import Utils from "./utils";

export class AbapPublicClass {
  public name: string;
  public hash: string;
  public def: string;
  public imp: string;
}

export class ClassParser {

  public static anonymizeTypeName(prefix15: string, type: string, name: string): string {
    let typeSeed = Utils.hashCodeOf(type);
    let typeAlias = Utils.randomStringOfLength(typeSeed, 5);

    let nameSeed = Utils.hashCodeOf(name);
    let nameAlias = Utils.randomStringOfLength(nameSeed, 10);

    return typeAlias + prefix15 + nameAlias;
  }

  public static renameLocalType(oldName: string, newName: string, parent: string, oldCode: string): string {
    let occurrences = [
      // interface declaration
      { context: "* renamed: " + parent + " :: " + oldName + "\n",
        regstr: "^(\s*interface\\s+)" + oldName + "(\\s*\\.)",
      },
      // class declaration
      { context: "* renamed: " + parent + " :: " + oldName + "\n",
        regstr: "^(\s*class\\s+)" + oldName + "(\\s+definition\\b)",
      },
      { context: "",
        regstr:  "^([^*\"\\n]*\\b)" + oldName + "(\\b)",
      },
    ];

    let newCode = oldCode;
    for (let occurrence of occurrences) {
      let regexp = new RegExp(occurrence.regstr, "igm");
      newCode = newCode.replace(regexp, occurrence.context + "$1" + newName + "$2");
    }

    return newCode;
  }

  public static buildLocalFileName(part: string, publicClass: AbapPublicClass): string {
    return publicClass.name + ".clas.locals_" + part + ".abap";
  }

  public static findFileByName(filename: string, list: FileList ): File {
    filename = filename.toLowerCase();

    let length = list.length();
    for (let i = 0; i < length; ++i) {
      let file = list.get(i);
      if (filename === file.getFilename().toLowerCase()) {
        return file;
      }
    }

    return null;
  }

  public static parseLocalContents(part: string, publicClass: AbapPublicClass, local: string): void {
    let global = local + "\n" + publicClass[part];

    let regex = /^\s*((CLASS)\s+(\w+)\s+DEFINITION\s*[^\.]*|(INTERFACE)\s+(\w+)\s*)\./gim;
    let definition;

    /* tslint:disable:no-conditional-assignment */
    while ((definition = regex.exec(local)) !== null) {
      let type = definition[2];
      let name = definition[3];

      if (!type) {
        // not class, dealing with interface
        type = definition[4];
        name = definition[5];
      }

      let alias = ClassParser.anonymizeTypeName(publicClass.hash, type, name);
      global = ClassParser.renameLocalType(name, alias, publicClass.name, global);

      // prepend (definition)? deferred
      let decl = type + " " + alias;
      if (type.toLowerCase() === "class") {
        decl = decl + " DEFINITION";
      }
      global = decl + " DEFERRED.\n" + global;

      // types of the local definitions are used in the (public|local)
      // implementation. so, after we must update the implementation after
      // we finish processing the local definitions.
      if (part === "def") {
        // this is the only difference between processing definitions and
        // implementations - which can be handled by one function otherwise
        publicClass.imp = ClassParser.renameLocalType(name, alias, publicClass.name, publicClass.imp);
      }
    }

    publicClass[part] = global;
  }

  public static tryProcessLocalFile(part: string, publicClass: AbapPublicClass, list: FileList): void {
    let filename = ClassParser.buildLocalFileName(part, publicClass);
    let file = ClassParser.findFileByName(filename, list);
    if (file === null) {
      return;
    }

    let contents = file.getContents();
    ClassParser.parseLocalContents(part, publicClass, contents);
    file.markUsed();
  }

  public static parse(f: File, list: FileList): Class {

    let match = f.getContents().match(/^(([\s\S])*ENDCLASS\.)\s*(CLASS(.|\s)*)$/i);
    if (!match || !match[1] || !match[2] || !match[3]) {
      throw "error parsing class: " + f.getFilename();
    }

    let publicClass = new AbapPublicClass();
    publicClass.name = f.getFilename().split(".")[0];
    publicClass.hash = Utils.randomStringOfLength(Utils.hashCodeOf(publicClass.name), 15);
    publicClass.def = this.makeLocal(publicClass.name, match[1]);
    publicClass.imp = match[3];

    // make sure we parse the imp part at the very first step!
    ClassParser.tryProcessLocalFile("imp", publicClass, list);
    // because the local definitions are used in the implementation.
    ClassParser.tryProcessLocalFile("def", publicClass, list);

    let superMatch = publicClass.def.match(/INHERITING FROM (Z\w+)/i);
//    console.dir(superMatch);
    let dependencies = [];
    if (superMatch && superMatch[1]) {
      dependencies.push(superMatch[1].toLowerCase());
    }

    return new Class(publicClass.name, publicClass.def, publicClass.imp, dependencies);
  }

  private static makeLocal(name: string, s: string): string {
    let reg1 = new RegExp("CLASS\\s+" + name + "\\s+DEFINITION\\s+PUBLIC", "i");
    let ret = s.replace(reg1, "CLASS " + name + " DEFINITION");
    let reg2 = new RegExp("GLOBAL\\s+FRIENDS\\s+ZCL_ABAPGIT", "i");
    ret = ret.replace(reg2, "FRIENDS ZCL_ABAPGIT");
    return ret;
  }
}
