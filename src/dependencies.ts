/**
 * Finds the classes and interfaces a definition needs to be fully defined
 * before it: a DEFINITION DEFERRED is enough for a TYPE REF TO, but not for
 * a superclass, an implemented interface, a component (name=>comp,
 * name~comp), an exception in a RAISING clause or the class of an event
 * handler.
 */
export default class Dependencies {

  /** removes comments and blanks out the contents of literals */
  public static codeOnly(contents: string): string {
    return contents.split("\n").map(line => {
      if (line.startsWith("*")) {
        return "";
      }

      let result = "";
      let literal: "'" | "`" | "|" | undefined;
      for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (!literal && character === "\"") {
          break;
        }

        if (!literal && (character === "'" || character === "`" || character === "|")) {
          literal = character;
          result += " ";
          continue;
        }

        if (literal) {
          if (character === literal) {
            if (line[index + 1] === literal) {
              result += "  ";
              index++;
              continue;
            }
            literal = undefined;
          }
          result += " ";
          continue;
        }

        result += character;
      }
      return result;
    }).join("\n");
  }

  /**
   * @param self name of the class or interface the code belongs to
   * @param contents its definition
   * @param known names of all classes and interfaces of the merge, lower case
   * @returns the known names the definition needs, lower case
   */
  public static find(self: string, contents: string, known: Set<string>): string[] {
    const code = Dependencies.codeOnly(contents);
    const found = new Set<string>();

    const add = (name: string) => {
      name = name.toLowerCase();
      if (name !== self.toLowerCase() && known.has(name)) {
        found.add(name);
      }
    };
    const addAll = (list: string) => {
      for (const name of list.match(/[\w/]+/g) || []) {
        add(name);
      }
    };

    for (const match of code.matchAll(/\bINHERITING\s+FROM\s+([\w/]+)/ig)) {
      add(match[1]);
    }
    for (const match of code.matchAll(/([\w/]+)(?:=>|~)/g)) {
      add(match[1]);
    }
    for (const match of code.matchAll(/\bFOR\s+EVENT\s+[\w/~]+\s+OF\s+([\w/]+)/ig)) {
      add(match[1]);
    }
    for (const match of code.matchAll(/(?:^|\.)\s*INTERFACES\b([^.]*)(?=\.)/ig)) {
      addAll(match[1]);
    }
    for (const match of code.matchAll(/\bRAISING\b([^.,]*)/ig)) {
      addAll(match[1]);
    }

    return [...found];
  }
}
