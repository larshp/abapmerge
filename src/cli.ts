import * as fs from "fs";
import * as path from "path";
import File from "./file";
import Merge from "./merge";

class Logic {

  public static readFiles(dir: string): File[] {
    let files = fs.readdirSync(dir);
    let output: File[] = [];

    for (let file of files) {
      let contents = fs.readFileSync(dir + "/" + file, "utf8");
      output.push(new File(file, contents));
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

  output = Merge.merge(Logic.readFiles(dir), main.split(".")[0]);
}

process.stdout.write(output);
