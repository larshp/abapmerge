import * as fs from "fs";
import * as path from "path";
import File from "./file";
import FileList from "./file_list";
import Merge from "./merge";
import { Command } from "commander";
import PackageInfo from "../package.json";

interface ICliArgs {
  entryFilename: string;
  entryDir: string;
  skipFUGR: boolean;
  noFooter: boolean;
  newReportName: string;
}

export class Logic {
  private static textFiles = new Set([".abap", ".xml", ".css", ".js"]);

  private static isTextFile(filepath: string): boolean {
    return Logic.textFiles.has(path.extname(filepath).toLowerCase());
  }

  private static readFiles(dir: string, pre = ""): FileList {
    let files = fs.readdirSync(dir);
    let list = new FileList();

    for (let file of files) {
      let filepath = path.join(dir, file);

      if (fs.lstatSync(filepath).isFile()) {
        if (Logic.isTextFile(filepath)) {
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
        list.concat(this.readFiles(filepath, path.join(pre, file)));
      }
    }

    return list;
  }

  public static parseArgs(args: string[]): ICliArgs {
    const commander = new Command();
    commander
      .storeOptionsAsProperties(false)
      .description(PackageInfo.description)
      .version(PackageInfo.version)
      .option("-f, --skip-fugr", "ignore unused function groups", false)
      .option("--without-footer", "do not append footers", false)
      .option(
        "-c, --change-report-name <newreportname>",
        "changes report name in REPORT clause in source code",
      )
      .arguments("<entrypoint>");
    commander.parse(args);

    if (!commander.args.length) {
      throw Error("Specify entrypoint file name");
    } else if (commander.args.length > 1) {
      throw Error("Specify just one entrypoint");
    }

    const entrypoint = commander.args[0];
    if (!fs.existsSync(entrypoint)) {
      throw new Error(`File "${entrypoint}" does not exist`);
    }

    const entryDir = path.dirname(entrypoint);
    const entryFilename = path.basename(entrypoint);
    const cmdOpts = commander.opts();

    return {
      entryDir,
      entryFilename,
      skipFUGR: cmdOpts.skipFugr,
      noFooter: cmdOpts.withoutFooter,
      newReportName: cmdOpts.changeReportName,
    };
  }

  public static run(args: string[]) {
    try {
      let output = "";
      const parsedArgs = Logic.parseArgs(args);
      const entryObjectName = parsedArgs.entryFilename.split(".")[0];
      output = Merge.merge(
        Logic.readFiles(parsedArgs.entryDir),
        entryObjectName,
        {
          skipFUGR: parsedArgs.skipFUGR,
          newReportName: parsedArgs.newReportName,
          appendAbapmergeMarker: parsedArgs.noFooter === false,
        },
      );
      process.stdout.write(output);
      if (output === undefined) throw new Error("output undefined, hmm?");
      return 0;
    } catch (e) {
      process.stderr.write(e.message || e.toString());
      return 1;
    }
  }
}
