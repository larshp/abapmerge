import {expect} from "chai";
import Merge from "../src/merge";
import File from "../src/file";
import FileList from "../src/file_list";

describe("locals", () => {
  it("class with locals, ", () => {

    const abap1 = `CLASS zcl_locals_test DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS public_method .
  PROTECTED SECTION.
  PRIVATE SECTION.
    CLASS-METHODS private_method .
ENDCLASS.
CLASS ZCL_LOCALS_TEST IMPLEMENTATION.
  METHOD private_method.
  ENDMETHOD.
  METHOD public_method.
    lcl_abap_to_json=>run( ).
  ENDMETHOD.
ENDCLASS.`;

    const abap2 = `CLASS lcl_abap_to_json DEFINITION FINAL.
PUBLIC SECTION.
  CLASS-METHODS run.
ENDCLASS.

CLASS zcl_locals_test DEFINITION LOCAL FRIENDS lcl_abap_to_json.

CLASS lcl_abap_to_json IMPLEMENTATION.
METHOD run.
  zcl_locals_test=>private_method( ).
ENDMETHOD.
ENDCLASS.`;

    let files = new FileList();
    files.push(new File("zcl_locals_test.clas.abap", abap1));
    files.push(new File("zcl_locals_test.clas.locals_imp.abap", abap2));
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinclude."));
    files.push(new File("zinclude.abap", "WRITE / 'Hello World!'."));
    const result = Merge.merge(files, "zmain");
    expect(result).to.include("CLASS zcl_locals_test DEFINITION LOCAL FRIENDS");
  });
});
