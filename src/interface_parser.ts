import File from "./file";
import Class from "./class";

export default class InterfaceParser {

  private static codeOnly(contents: string): string {
    return contents.split("\n").map(line => {
      if (line.startsWith("*")) {
        return "";
      }

      let result = "";
      let literal: "'" | "`" | "|" | undefined;
      for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (!literal && character === "\"") {
          break;
        }

        if (!literal && (character === "'" || character === "`" || character === "|")) {
          literal = character;
          result += " ";
          continue;
        }

        if (literal) {
          if (character === literal) {
            if (line[index + 1] === literal) {
              result += "  ";
              index++;
              continue;
            }
            literal = undefined;
          }
          result += " ";
          continue;
        }

        result += character;
      }
      return result;
    }).join("\n");
  }

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
    const code = InterfaceParser.codeOnly(f.getContents());
    const typeDeps = code.matchAll(/TYPE\s+([^.,\n]+)?(ZIF_\w+)(=?)/ig);
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

    const interfaceDeps = code.matchAll(/INTERFACES(:)?\s+(ZIF_\w+)/ig);
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
