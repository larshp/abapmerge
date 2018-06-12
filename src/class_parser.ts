import File from "./file";
import Class from "./class";

export default class ClassParser {

  public static parse(f: File): Class {

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

    return new Class(name, def, match[3], dependencies);
  }

  private static makeLocal(name: string, s: string): string {
    let reg1 = new RegExp("CLASS\\s+" + name + "\\s+DEFINITION\\s+PUBLIC", "i");
    let ret = s.replace(reg1, "CLASS " + name + " DEFINITION");
    let reg2 = new RegExp("GLOBAL\\s+FRIENDS\\s+ZCL_ABAPGIT", "i");
    ret = ret.replace(reg2, "FRIENDS ZCL_ABAPGIT");
    return ret;
  }

}
