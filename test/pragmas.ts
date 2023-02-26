/* eslint-disable @typescript-eslint/naming-convention */
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
  it("include a file with pragma", () => {
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

  it("include a file with pragma, base64", () => {
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

  it("include a cua from XML", () => {
    let files = buildFileList({
      "zmain.abap": `
        REPORT zmain.
          DATA ls_cua TYPE ty_cua.
          " @@abapmerge include-cua some.xml > ls_cua
      `.trim().split("\n"),
      "some.xml": `
        <?xml version="1.0" encoding="utf-8"?>
        <abapGit version="v1.0.0" serializer="LCL_OBJECT_PROG" serializer_version="v1.0.0">
        <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
          <asx:values>
            <PROGDIR>
              <NAME>SOME</NAME>
            </PROGDIR>
            <CUA>
              <ADM>
                <PFKCODE>000001</PFKCODE>
              </ADM>
              <STA>
                <RSMPE_STAT>
                  <CODE>DECIDE_DIALOG</CODE>
                  <MODAL>P</MODAL>
                </RSMPE_STAT>
              </STA>
              <FUN>
                <RSMPE_FUNT>
                  <CODE>CANCEL</CODE>
                  <TEXTNO>001</TEXTNO>
                </RSMPE_FUNT>
                <RSMPE_FUNT>
                  <CODE>OK</CODE>
                  <TEXTNO>002</TEXTNO>
                </RSMPE_FUNT>         
              </FUN>
          </CUA>
          </asx:values>
        </asx:abap>
        </abapGit>
      `,
    });

    const newList = PragmaProcessor.process(files, { noComments: true });
    expect(newList.length()).to.equal(2);

    const main = newList.get(0);

    // Keep the indentation ! (to match the files above)
    expect(main.getContents()).to.equal(`
        REPORT zmain.
          DATA ls_cua TYPE ty_cua.
          DATA ls_sta LIKE LINE OF ls_cua-sta.
          DATA ls_fun LIKE LINE OF ls_cua-fun.
          ls_cua-adm-pfkcode = '000001'.
          CLEAR ls_sta.
          ls_sta-code = 'DECIDE_DIALOG'.
          ls_sta-modal = 'P'.
          APPEND ls_sta TO ls_cua-sta.
          CLEAR ls_fun.
          ls_fun-code = 'CANCEL'.
          ls_fun-textno = '001'.
          APPEND ls_fun TO ls_cua-fun.
          CLEAR ls_fun.
          ls_fun-code = 'OK'.
          ls_fun-textno = '002'.
          APPEND ls_fun TO ls_cua-fun.
    `.trim());

    const inc = newList.get(1);
    expect(inc.wasUsed()).to.equal(true);
  });
});
