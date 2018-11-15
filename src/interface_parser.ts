import File from "./file";
import Class from "./class";

export default class InterfaceParser {

  public static parse(f: File): Class {

    let self = f.getFilename().split(".")[0];
    let match = f.getContents().match(/^\s*(INTERFACE\s+\S+)\s+PUBLIC([\s\S]+)$/i);
    if (!match || !match[1] || !match[2]) {
      throw "error parsing interface: " + f.getFilename();
    }

    let depMatch = f.getContents().match(/TYPE\sZIF_\w+/ig);
    let dependencies = [];
    if (depMatch) {
      for (let dep of depMatch) {
        let name = dep.substr(5).toLowerCase();
        if (dependencies.indexOf(name) === -1 && name !== self) {
          dependencies.push(name);
        }
      }
    }
    return new Class(self, match[1] + match[2], "", dependencies);

  }

}
