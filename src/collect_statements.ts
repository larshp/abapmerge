/** collect statements split over multiple lines into single lines */
export class CollectStatements {

  public static collect(code: string): string {
    const output: string[] = [];

    const lines = code.split("\n");
    while (lines.length > 0) {
      const line = lines.shift();
      if (line.trimStart().toUpperCase().startsWith("REPORT ") === false
          && line.trimStart().toUpperCase().startsWith("INCLUDE ") === false) {
        output.push(line);
        continue;
      }

      let add = line;
      while (add.includes(".") === false) {
        add += " " + lines.shift();
      }
      output.push(add);
    }

    return output.join("\n");
  }

}
