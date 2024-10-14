import { expect } from "chai";
import Merge from "../src/merge";
import File from "../src/file";
import FileList from "../src/file_list";

describe("Local class include", () => {
  it("Program with local class that contains include", () => {

    const files = new FileList();

    files.push(new File("zfoo.abap", `
REPORT zfoo.

CLASS main DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS main IMPLEMENTATION.
  METHOD run.
    INCLUDE zhello.
  ENDMETHOD.
ENDCLASS.

START-OF-SELECTION.
NEW main( )->run( ).
      `));

    files.push(new File("zhello.abap", "WRITE / 'Hello World!'."));

    const result = Merge.merge(files, "zfoo");
    expect(result).to.be.a("string");
    expect(result).to.include("World");

  });
});

describe("Global class include", () => {
  it("Program and global class that contains include", () => {

    const files = new FileList();

    files.push(new File("zfoo.abap", `
REPORT zfoo.

START-OF-SELECTION.
NEW zcl_main( )->run( ).
      `));

    files.push(new File("zcl_main.abap", `
CLASS zcl_main DEFINITION.
  PUBLIC SECTION.
    METHODS run.
ENDCLASS.

CLASS zcl_main IMPLEMENTATION.
  METHOD run.
    INCLUDE zhello.
  ENDMETHOD.
ENDCLASS.
      `));

    files.push(new File("zhello.abap", "WRITE / 'Hello World!'."));

    const result = Merge.merge(files, "zfoo");
    expect(result).to.be.a("string");
    expect(result).to.include("World");

  });
});



