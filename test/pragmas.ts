// import { expect } from "chai";
import PragmaProcessor from "../src/pragma";
import File from "../src/file";
import FileList from "../src/file_list";

function buildFileList(mock) {
  const files = new FileList();
  for (const [filename, data] of Object.entries(mock)) {
    files.push(new File(filename, (data as string[]).join("\n")));
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

    const output = PragmaProcessor.process(files);
    console.log(output);
  });
});
