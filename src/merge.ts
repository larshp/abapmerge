import FileList from "./file_list";
import PragmaProcessor from "./pragma";
import ClassList from "./class_list";
import AbapmergeMarker from "./abapmerge_marker";

export default class Merge {
  private static files: FileList;
  private static classes: ClassList;

  public static merge(files: FileList, main: string, options?: {
    skipFUGR?: boolean;
    newReportName?: string;
    appendAbapmergeMarker?: boolean;
  }): string {
    this.files = files;
    if (!options) options = {};

    if (options.skipFUGR) {
      this.files = this.skipFUGR(this.files);
    }
    this.files = PragmaProcessor.process(this.files);
    this.classes = new ClassList(this.files);

    let newReportName;
    if (options.newReportName) {
      newReportName = options.newReportName;
    }

    let result = this.analyze(main, this.files.fileByName(main).getContents(), newReportName);
    this.files.checkFiles();

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
    let lines = contents.split("\n");
    let isMainReport = false;

    let lineNo = 0;
    if (main !== null) {
      while (lineNo < lines.length) {
        let line = lines[lineNo++];
        let regexReportClause = /(^\s*REPORT\s+)([\w/]+)(\s+[^.*]*\.|\s*\.)$/im;
        let reportClauseMatches = line.match(regexReportClause);

        if (reportClauseMatches) {
          isMainReport = reportClauseMatches[2].toLowerCase() === main.toLowerCase();
          if (newReportName) {
            line = line.replace( regexReportClause, `$1${newReportName}$3`);
          }
        }

        output += line + "\n";

        if (isMainReport) {
          isMainReport = false;
          break;
        }
      }

      while (lineNo < lines.length) {
        let line = lines[lineNo];

        if (!line.match(/^((\*.*)|(\s*))$/im)) {
          output += this.classes.getResult();
          break;
        }

        output += line + "\n";
        ++lineNo;
      }
    }

    for ( ; lineNo < lines.length; ++lineNo) {
      let line = lines[lineNo];
      let include = line.match(/^\s*INCLUDE\s+(z\w+)\s*\.\s*.*$/i);
      if (!include) {
        // try namespaced
        include = line.match(/^\s*INCLUDE\s+(\/\w+\/\w+)\s*\.\s*.*$/i);
        if (include) {
          include[1] = include[1].replace(/\//g, "#");
        }
      }
      if (include) {
        output = output +
          this.comment(include[1]) +
          this.analyze(null, this.files.fileByName(include[1]).getContents()) +
          "\n";
      } else {
        output += line + "\n";
      }
    }

    return output.replace(/\n{3}|\n{2}$/g, "\n");
  }

  private static comment(name: string): string {
    return "****************************************************\n" +
           "* abapmerge - " + name.toUpperCase() + "\n" +
           "****************************************************\n";
  }
}
