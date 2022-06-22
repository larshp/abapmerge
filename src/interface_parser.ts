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

    // this should capture just elements of an interface "zif=>..."
    // if interface itself is referred, then it is probably a REF TO
    // REF TOs will be solved by deferred definitions are not taken into account
    // (maybe it is wrong by the way, as it helps to identify cyclic dependencies)
    const typeDeps = f.getContents().matchAll(/TYPE\s+([^.,\n]+)?(ZIF_\w+)(=?)/ig);
    if (typeDeps) {
      for (const dep of typeDeps) {
        const furtherIfElementMarker = dep[3];
        if (!furtherIfElementMarker) {
          const typeAtrrs = dep[1];
          if (typeAtrrs.endsWith("VALUE '")) {
            continue;
          }
          if (!/REF\s+TO/i.test(typeAtrrs)) {
            throw new Error(`Unexpected interface ref: ${dep.toString()}`);
          }
          continue;
        }
        const ifName = dep[2].toLowerCase();
        if (ifName !== self) {
          dependencies.add(ifName);
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
