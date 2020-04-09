import {expect} from "chai";
import File from "../src/file";
import Merge from "../src/merge";
import FileList from "../src/file_list";

describe("classes 1, test", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinclude."));
    files.push(new File("zinclude.abap", "WRITE / 'Hello World!'."));
    files.push(new File(
      "zcl_abapgit_test_serialize.clas.abap",
      `CLASS zcl_abapgit_test_serialize DEFINITION PUBLIC CREATE PUBLIC FOR TESTING .
      ENDCLASS.
      CLASS zcl_abapgit_test_serialize IMPLEMENTATION.
      ENDCLASS.`));

    const result = Merge.merge(files, "zmain");
    expect(result).to.not.contain("zcl_abapgit_test_serialize");
  });
});
