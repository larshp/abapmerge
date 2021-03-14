import File from "./file";
import Class from "./class";

export default class InterfaceParser {

  public static parse(f: File): Class {

    const self = f.getFilename().split(".")[0];
    const ifDefinition = f.getContents().match(/^[\s\S]*(INTERFACE\s+\S+)\s+PUBLIC([\s\S]+)$/i);
    if (!ifDefinition || !ifDefinition[1] || !ifDefinition[2]) {
      throw "error parsing interface: " + f.getFilename();
    }

    const dependencies = new Set();

    const typeDeps = f.getContents().matchAll(/TYPE\s+([^.,]+)?(ZIF_\w+)/ig);
    if (typeDeps) {
      for (const dep of typeDeps) {
        const name = dep[2].toLowerCase();
        if (name !== self) {
          dependencies.add(name);
        }
      }
    }

    const interfaceDeps = f.getContents().matchAll(/INTERFACES(:)?\s+(ZIF_\w+)/ig);
    if (interfaceDeps) {
      for (const dep of interfaceDeps) {
        const name = dep[2].toLowerCase();
        if (name !== self) {
          dependencies.add(name);
        }
      }
    }

    return new Class(
      self,
      ifDefinition[1] + ifDefinition[2],
      false,
      "",
      [...dependencies.values()] as string[]
    );

  }

}
