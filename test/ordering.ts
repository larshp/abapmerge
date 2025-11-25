import {expect} from "chai";
import Merge from "../src/merge";
import File from "../src/file";
import FileList from "../src/file_list";

describe("Order by dependency", () => {
  it("something", () => {
    const files = new FileList();

    files.push(new File("zfoo.prog.abap",
      `REPORT zfoo.
START-OF-SELECTION.
  DATA(o) = NEW za( ).
  o->run( 'Hello, World!' ).`));

    files.push(new File("za.clas.abap",
      `CLASS za DEFINITION PUBLIC.
PUBLIC SECTION.
  METHODS run IMPORTING str TYPE zb=>btype.
ENDCLASS.
CLASS za IMPLEMENTATION.
  METHOD run.
    WRITE / str.
  ENDMETHOD.
ENDCLASS.`));

    files.push(new File("zb.clas.abap",
      `CLASS zb DEFINITION PUBLIC.
PUBLIC SECTION.
  TYPES btype TYPE string.
ENDCLASS.
CLASS zb IMPLEMENTATION.
ENDCLASS.`));

    const result = Merge.merge(files, "zfoo");
    expect(result).to.be.a("string");
    expect(result).to.include('DEFERRED.\nCLASS zb');
  });
});

describe("Fail on cyclical dependency", () => {
  it("something", () => {
    const files = new FileList();

    files.push(new File("zfoo.prog.abap",
      `REPORT zfoo.
START-OF-SELECTION.
  DATA(o) = NEW za( ).
  o->run( 'Hello, World!' ).`));

    files.push(new File("za.clas.abap",`
CLASS za DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES atype TYPE string.
  METHODS run IMPORTING str TYPE zb=>btype.
ENDCLASS.
CLASS za IMPLEMENTATION.
  METHOD run.
    WRITE / str.
  ENDMETHOD.
ENDCLASS.`));

    files.push(new File("zb.clas.abap",`
CLASS zb DEFINITION PUBLIC.
  PUBLIC SECTION.
    TYPES btype TYPE string.
    METHODS run IMPORTING str TYPE za=>atype.
ENDCLASS.
CLASS zb IMPLEMENTATION.
  METHOD run.
    WRITE / str.
  ENDMETHOD.
ENDCLASS.`));

    expect(Merge.merge.bind(Merge, files, "zfoo")).to.throw("Cannot merge cyclical dependency");

   });
});
