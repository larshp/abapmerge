import * as fs from "fs";
import * as path from "path";
import File from "./file";
import FileList from "./file_list";
import Merge from "./merge";

class Logic {

  public static readFiles(dir: string, pre = ""): FileList {
    let files = fs.readdirSync(dir);
    let out: FileList = new FileList();

    for (let file of files) {
      let full = dir + "/" + file;

      if (fs.lstatSync(full).isFile()) {
        let contents = fs.readFileSync(full, "utf8");
        out.push(new File(file, contents));
      } else {
        out = out.concat(this.readFiles(full, pre + file + "/"));
      }
    }

    return out;
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
