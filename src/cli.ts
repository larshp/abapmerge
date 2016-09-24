import * as fs from "fs";
import * as path from "path";
import File from "./file";
import Merge from "./merge";

class Logic {
  public static fname(s: string): string {
    return s.split(".")[0];
  }

  public static readFiles(dir: string): File[] {
    let files = fs.readdirSync(dir);
    let output: File[] = [];

    for (let file of files) {
      if (file.match(/.abap$/)) {
        let contents = fs.readFileSync(dir + "/" + file, "utf8");
        output.push(new File(this.fname(file), contents));
      }
    }

    return output;
  }
}

let arg = process.argv.slice(2);
let output = "";

if (arg.length === 0) {
  output = "Supply filename\n";
} else {
  let dir = path.dirname(arg[0]);
  let main = path.basename(arg[0]);

  output = Merge.merge(Logic.readFiles(dir), Logic.fname(main));
}

process.stdout.write(output);
