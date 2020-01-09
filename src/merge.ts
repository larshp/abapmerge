import FileList from './file_list';
import PragmaProcessor from './pragma';
import ClassList from './class_list';

export default class Merge {
  private static files: FileList;
  private static classes: ClassList;

  public static merge(
    files: FileList,
    main: string,
    options?: { skipFUGR?: boolean; newReportClauseName?: string },
  ): string {
    this.files = files;

    if (options && options.skipFUGR) {
      this.files = this.skipFUGR(this.files);
    }
    this.files = PragmaProcessor.process(this.files);
    this.classes = new ClassList(this.files);

    let newReportClauseName;
    if (options && options.newReportClauseName) {
      newReportClauseName = options.newReportClauseName;
    }

    let result = this.analyze(
      main,
      this.files.fileByName(main).getContents(),
      newReportClauseName,
    );
    this.files.checkFiles();
    return result;
  }

  public static appendFooter(contents: string, version: string): string {
    return (
      contents +
      '****************************************************\n' +
      'INTERFACE lif_abapmerge_marker.\n' +
      'ENDINTERFACE.\n' +
      '****************************************************\n' +
      '* abapmerge ' +
      version +
      ' - ' +
      new Date().toJSON() +
      '\n' +
      '****************************************************\n'
    );
  }

  private static skipFUGR(files: FileList): FileList {
    let result = new FileList();

    for (let i = 0; i < files.length(); i++) {
      let file = files.get(i);
      if (file.getFilename().match(/\.fugr\./)) {
        continue;
      }
      result.push(file);
    }

    return result;
  }

  private static analyze(
    main: string,
    contents: string,
    newReportClauseName?: string,
  ) {
    let output = '';
    let lines = contents.split('\n');
    let isMainReport = false;

    let lineNo = 0;
    if (main !== null) {
      while (lineNo < lines.length) {
        let line = lines[lineNo++];
        let regexReportClause = /(^\s*REPORT\s+)([\w/]+)(\s+[^.*]*\.|\s*\.)$/im;
        let reportClauseMatches = line.match(regexReportClause);

        if (reportClauseMatches) {
          isMainReport = reportClauseMatches[2].toLowerCase() === main.toLowerCase();
          if (newReportClauseName) {
            line = line.replace( regexReportClause, `$1${newReportClauseName}$3`);
          }
        }

        output += line + '\n';

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

        output += line + '\n';
        ++lineNo;
      }
    }

    for (; lineNo < lines.length; ++lineNo) {
      let line = lines[lineNo];
      let include = line.match(/^\s*INCLUDE\s+(z\w+)\s*\.\s*.*$/i);
      if (!include) {
        // try namespaced
        include = line.match(/^\s*INCLUDE\s+(\/\w+\/\w+)\s*\.\s*.*$/i);
        if (include) {
          include[1] = include[1].replace(/\//g, '#');
        }
      }
      if (include) {
        output =
          output +
          this.comment(include[1]) +
          this.analyze(null, this.files.fileByName(include[1]).getContents()) +
          '\n';
      } else {
        output += line + '\n';
      }
    }

    return output.replace(/\n{3}|\n{2}$/g, '\n');
  }

  private static comment(name: string): string {
    return (
      '****************************************************\n' +
      '* abapmerge - ' +
      name.toUpperCase() +
      '\n' +
      '****************************************************\n'
    );
  }
}
