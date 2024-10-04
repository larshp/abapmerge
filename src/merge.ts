import FileList from "./file_list";
import PragmaProcessor from "./pragma";
import ClassList from "./class_list";
import AbapmergeMarker from "./abapmerge_marker";
import { CollectStatements } from "./collect_statements";

export default class Merge {
  private static files: FileList;
  private static classes: ClassList;

  public static merge(files: FileList, main: string, options?: {
    skipFUGR?: boolean;
    newReportName?: string;
    appendAbapmergeMarker?: boolean;
    allowUnused?: boolean;
  }): string {
    this.files = files;
    if (!options) options = {};

    if (options.skipFUGR) {
      this.files = this.skipFUGR(this.files);
    }
    this.files = PragmaProcessor.process(this.files);
    this.classes = new ClassList(this.files);

    let result = this.analyze(main, this.files.fileByName(main).getContents(), options.newReportName);
    this.files.validateAllFilesUsed(options.allowUnused);

    if (options.appendAbapmergeMarker) {
      result += new AbapmergeMarker().render();
    }

    return result;
  }

  private static skipFUGR(files: FileList): FileList {
    const filesWithoutFugrs = [...files].filter(f => !f.getFilename().match(/\.fugr\./));
    return new FileList(filesWithoutFugrs);
  }

  private static analyze(main: string, contents: string, newReportName?: string) {
    let output = "";
    const lines = CollectStatements.collect(contents).split("\n");
    console.dir(lines);
    let isMainReport = false;

    let lineNo = 0;
    if (main !== null) {
      while (lineNo < lines.length) {
        let line = lines[lineNo++];
        const regexReportClause = /(^\s*REPORT\s+)([\w/]+)(\s+[^.*]*\.|\s*\.)/im;
        const reportClauseMatches = line.match(regexReportClause);

        if (reportClauseMatches) {
          isMainReport = reportClauseMatches[2].toLowerCase() === main.toLowerCase().replace(/#/g, "/");
          if (newReportName) {
            line = line.replace(regexReportClause, `$1${newReportName}$3`);
          }
        }

        output += line + "\n";

        if (isMainReport) {
          isMainReport = false;
          break;
        }
      }

      while (lineNo < lines.length) {
        const line = lines[lineNo];

        if (!line.match(/^((\*.*)|(\s*))$/im)) {
          output += this.classes.getResult();
          break;
        }

        output += line + "\n";
        ++lineNo;
      }
    }

    for ( ; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo];
      const includes = this.matchIncludeStatement(line);
      if (includes) {
        for (const include of includes) {
          output = output +
            this.comment(include) +
            this.analyze(null, this.files.fileByName(include).getContents()) +
            "\n";
        }
      } else {
        output += line + "\n";
      }
    }

    return output.replace(/\n{3}|\n{2}$/g, "\n");
  }

  /** returns INCLUDE names if found in current line */
  private static matchIncludeStatement(line: string): string[] | undefined {
    let include = line.match(/^\s*INCLUDE\s+(z\w+)\s*\./i);
    if (!include) {
      // try namespaced
      include = line.match(/^\s*INCLUDE\s+(\/\w+\/\w+)\s*\./i);
      if (include) {
        include[1] = include[1].replace(/\//g, "#");
      }
    }
    if (!include) {
      // try chained
      const moo = line.matchAll(/^\s*INCLUDE\s*:\s+(z\w+)(?:,\s*(z\w+))*\s*\./gi);
      const found: string[] = [];
      for (const m of moo) {
        for (let i = 1; i < 10; i++) {
          const element = m[i];
          if (element === undefined) {
            return found;
          }
          found.push(element);
        }
      }
    }
    if (!include) {
      // try chained namespaced
      const moo = line.matchAll(/^\s*INCLUDE\s*:\s+(\/\w+\/\w+)(?:,\s*(\/\w+\/\w+))*\s*\./gi);
      const found: string[] = [];
      for (const m of moo) {
        for (let i = 1; i < 10; i++) {
          const element = m[i];
          if (element === undefined) {
            return found;
          }
          found.push(element);
        }
      }
    }
    if (include === null) {
      return undefined
    }
    return [include[1]];
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }
}
