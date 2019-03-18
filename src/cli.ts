import * as fs from "fs";
import * as path from "path";
import File from "./file";
import FileList from "./file_list";
import Merge from "./merge";

class Logic {
  private static textFiles = new Set([".abap", ".xml", ".css", ".js"]);

  public static readFiles(dir: string, pre = ""): FileList {
    let files = fs.readdirSync(dir);
    let list: FileList = new FileList();

    for (let file of files) {
      let filepath = path.join(dir, file);

      if (fs.lstatSync(filepath).isFile()) {
        if (Logic.textFiles.has(path.extname(filepath).toLowerCase())) {
          let contents = fs.readFileSync(filepath, "utf8")
            .replace(/\t/g, "  ") // remove tabs
            .replace(/\r/g, "");  // unify EOL
          list.push(new File(file, contents));
        } else {
          let buffer = fs.readFileSync(filepath);
          list.push(new File(file, buffer));
        }
      } else {
        list = list.concat(this.readFiles(filepath, path.join(pre, file)));
      }
    }

    return list;
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
    let retval = 0;
    let output = "";
    try {
      const parsedArgs = Logic.parseArgs();
      const entryPoint = parsedArgs.main.split(".")[0];
      output = Merge.merge(Logic.readFiles(parsedArgs.dir), entryPoint, {skipFUGR: parsedArgs.skipFUGR});
      output = Merge.appendFooter(output);
      process.stdout.write(output);
    } catch (e) {
      output = e.message ? e.message : e;
      retval = 1;
      process.stderr.write(output);
    }
    if (output === undefined) { throw new Error("output undefined, hmm?"); }
    return retval;
  }

}

process.exit(Logic.run());
