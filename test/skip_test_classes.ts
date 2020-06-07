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

describe("classes 2, remove test classes from friends", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File("zmain.abap", "REPORT zmain.\n\ndata: foo type ref to zcl_serialize."));
    files.push(new File("zcl_serialize.clas.abap", `class zcl_serialize definition public global friends zcl_abapgit_test_serialize .
    public section.
    endclass.
    class zcl_serialize implementation.
    endclass.`));
    files.push(new File(
      "zcl_abapgit_test_serialize.clas.abap",
      `CLASS zcl_abapgit_test_serialize DEFINITION PUBLIC CREATE PUBLIC FOR TESTING .
      ENDCLASS.
      CLASS zcl_abapgit_test_serialize IMPLEMENTATION.
      ENDCLASS.`));

    const result = Merge.merge(files, "zmain");
    expect(result).to.not.match(/zcl_abapgit_test_serialize/i);
  });
});
