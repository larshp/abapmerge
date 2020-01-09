import * as fs from "fs";
import * as path from "path";
import File from "./file";
import FileList from "./file_list";
import Merge from "./merge";
import commander from "commander";
import PackageInfo from "../package.json";

interface ICliArgs {
  entryFilename: string;
  entryObjectName: string;
  entryDir: string;
  skipFUGR: boolean;
  noFooter: boolean;
  newReportName: string;
}

class Logic {
  private static textFiles = new Set([".abap", ".xml", ".css", ".js"]);

  public static readFiles(dir: string, pre = ""): FileList {
    let files = fs.readdirSync(dir);
    let list: FileList = new FileList();

    for (let file of files) {
      let filepath = path.join(dir, file);

      if (fs.lstatSync(filepath).isFile()) {
        if (Logic.textFiles.has(path.extname(filepath).toLowerCase())) {
          let contents = fs
            .readFileSync(filepath, "utf8")
            .replace(/\t/g, "  ") // remove tabs
            .replace(/\r/g, ""); // unify EOL
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

  public static parseArgs(): ICliArgs {
    commander
      .description(PackageInfo.description)
      .version(PackageInfo.version)
      .option("-f, --skip-fugr", "ignore unused function groups", false)
      .option("--without-footer", "do not append footers", false)
      .option(
        "-c, --change-report-name <newreportname>",
        "changes report name in REPORT clause in source code",
      )
      .arguments("<entrypoint>");
    commander.parse(process.argv);

    if (!commander.args.length) {
      throw Error("Specify entrypoint file name");
    } else if (commander.args.length > 1) {
      throw Error("Specify just one entrypoint");
    }

    const entrypoint = commander.args[0];
    if (!fs.existsSync(entrypoint)) {
      throw new Error(`File "${entrypoint}" does not exist`);
    }

    let entryDir = path.dirname(entrypoint);
    let entryFilename = path.basename(entrypoint);

    return {
      entryDir,
      entryFilename,
      entryObjectName: entryFilename.split(".")[0],
      skipFUGR: commander.skipFugr,
      noFooter: commander.withoutFooter,
      newReportName: commander.changeReportname,
    };
  }

  public static run() {
    let retval = 0;
    let output = "";
    try {
      const parsedArgs = Logic.parseArgs();
      output = Merge.merge(
        Logic.readFiles(parsedArgs.entryDir),
        parsedArgs.entryObjectName,
        { skipFUGR: parsedArgs.skipFUGR },
      );
      if (parsedArgs.noFooter === false) {
        output = Merge.appendFooter(output, PackageInfo.version);
      }
      process.stdout.write(output);
    } catch (e) {
      output = e.message ? e.message : e;
      retval = 1;
      process.stderr.write(output);
    }
    if (output === undefined) throw new Error("output undefined, hmm?");
    return retval;
  }
}

process.exit(Logic.run());
