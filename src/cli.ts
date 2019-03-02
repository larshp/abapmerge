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
      let filepath = path.join(dir, file);

      if (fs.lstatSync(filepath).isFile()) {
        let contents = fs.readFileSync(filepath, "utf8");
        out.push(new File(file, contents));
      } else {
        out = out.concat(this.readFiles(filepath, path.join(pre, file)));
      }
    }

    return out;
  }

  public static parseArgs(): {main: string, dir: string, skipFUGR: boolean} {
    let arg = process.argv.slice(2);
    let skipFUGR = false;

    if (arg.length === 0) {
      throw new Error("Supply filename");
    }

    let index = arg.indexOf("-f");
    if (index >= 0) {
      skipFUGR = true;
      arg.splice(index, 1);
    }

    if (!fs.existsSync(arg[0])) {
      throw new Error(`File ${path} does not exist`);
    }

    let dir = path.dirname(arg[0]);
    let main = path.basename(arg[0]);

    return {main, dir, skipFUGR};
  }

  public static run() {
    let output = "";
    try {
      const parsedArgs = Logic.parseArgs();
      const entryPoint = parsedArgs.main.split(".")[0];
      output = Merge.merge(Logic.readFiles(parsedArgs.dir), entryPoint, {skipFUGR: parsedArgs.skipFUGR});
    } catch (e) {
      output = e.message ? e.message : e;
    }
    if (output === undefined) { throw new Error("output undefined, hmm?"); }
    process.stdout.write(output);
  }

}

Logic.run();
