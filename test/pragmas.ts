import { expect } from "chai";
import PragmaProcessor from "../src/pragma";
import File from "../src/file";
import FileList from "../src/file_list";

function buildFileList(mock) {
  const files = new FileList();
  for (const [filename, data] of Object.entries(mock)) {
    if (Array.isArray(data)) {
      files.push(new File(filename, (data as string[]).join("\n")));
    } else {
      files.push(new File(filename, data as Buffer));
    }
  }
  return files;
}

describe("Pragma include", () => {
  it("include", () => {
    let files = buildFileList({
      "zmain.abap": [
        "REPORT zmain.",
        "  \" @@abapmerge include some.txt > append '$$' to tab.",
      ],
      "some.txt": [
        "Hello",
        "World",
      ],
    });

    const newList = PragmaProcessor.process(files, { noComments: true });
    expect(newList.length()).to.equal(2);

    const main = newList.get(0);

    expect(main.getContents()).to.equal([
      "REPORT zmain.",
      "  append 'Hello' to tab.",
      "  append 'World' to tab.",
    ].join("\n"));

    const inc = newList.get(1);
    expect(inc.wasUsed()).to.equal(true);
  });

  it("include base64", () => {
    let files = buildFileList({
      "zmain.abap": [
        "REPORT zmain.",
        "  \" @@abapmerge include-base64 some.blob > append '$$' to tab.",
      ],
      "some.blob": Buffer.from("\x40\x41"),
    });

    const newList = PragmaProcessor.process(files, { noComments: true });
    expect(newList.length()).to.equal(2);

    const main = newList.get(0);

    expect(main.getContents()).to.equal([
      "REPORT zmain.",
      "  append 'QEE=' to tab.",
    ].join("\n"));

    const inc = newList.get(1);
    expect(inc.wasUsed()).to.equal(true);
  });
});
