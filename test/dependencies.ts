import * as chai from "chai";
import File from "../src/file";
import FileList from "../src/file_list";
import ClassList from "../src/class_list";
import Dependencies from "../src/dependencies";

const expect = chai.expect;

function cls(name: string, definition: string): File {
  return new File(
    name + ".clas.abap",
    "CLASS " + name + " DEFINITION PUBLIC" + definition + "\n" +
    "ENDCLASS.\n" +
    "CLASS " + name + " IMPLEMENTATION.\n" +
    "ENDCLASS.");
}

function intf(name: string, body: string): File {
  return new File(
    name + ".intf.abap",
    "INTERFACE " + name + " PUBLIC.\n" +
    body +
    "ENDINTERFACE.");
}

/** the sequence of the definitions in the merged result */
function sequence(files: File[]): string[] {
  const result = new ClassList(new FileList(files)).getResult();
  const found = result.matchAll(/^(?:CLASS (\w+) DEFINITION(?! DEFERRED)|INTERFACE (\w+)\s*\.)/gm);
  return [...found].map(m => m[1] || m[2]);
}

/** expects the sequence, whatever the sequence of the files is */
function expectSequence(files: File[], expected: string[]) {
  expect(sequence(files)).to.deep.equal(expected);
  expect(sequence([...files].reverse())).to.deep.equal(expected);
}

describe("dependencies, find", () => {
  const known = new Set(["zcl_a", "zcl_b", "/foo/cl_c"]);

  it("superclass, component, interface component", () => {
    const code = "CLASS zcl_x DEFINITION INHERITING FROM zcl_a.\n" +
      "  PUBLIC SECTION.\n" +
      "    DATA foo TYPE zcl_b=>ty_foo.\n" +
      "    ALIASES bar FOR /foo/cl_c~bar.\n" +
      "ENDCLASS.";
    expect(Dependencies.find("zcl_x", code, known)).to.have.members(["zcl_a", "zcl_b", "/foo/cl_c"]);
  });

  it("a reference is no dependency", () => {
    const code = "CLASS zcl_x DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "    DATA foo TYPE REF TO zcl_a.\n" +
      "ENDCLASS.";
    expect(Dependencies.find("zcl_x", code, known)).to.deep.equal([]);
  });

  it("comments and literals are no dependency", () => {
    const code = "CLASS zcl_x DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "* see zcl_a=>foo\n" +
      "    CONSTANTS foo TYPE string VALUE `zcl_b=>bar`. \" or zcl_a=>foo\n" +
      "ENDCLASS.";
    expect(Dependencies.find("zcl_x", code, known)).to.deep.equal([]);
  });

  it("raising, only up to the end of the method", () => {
    const code = "CLASS zcl_x DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "    METHODS: foo RAISING zcl_a,\n" +
      "      bar IMPORTING moo TYPE REF TO zcl_b.\n" +
      "ENDCLASS.";
    expect(Dependencies.find("zcl_x", code, known)).to.deep.equal(["zcl_a"]);
  });

  it("interfaces, event handler, unknown and own name", () => {
    const code = "CLASS zcl_x DEFINITION.\n" +
      "  PUBLIC SECTION.\n" +
      "    INTERFACES: zcl_a, zif_unknown.\n" +
      "    METHODS on FOR EVENT changed OF zcl_b.\n" +
      "    DATA foo TYPE zcl_x=>ty_foo.\n" +
      "ENDCLASS.";
    expect(Dependencies.find("zcl_x", code, known)).to.have.members(["zcl_a", "zcl_b"]);
  });
});

describe("dependencies, sequence of the definitions", () => {
  it("interfaces without the zif_ prefix", () => {
    expectSequence([
      intf("zabc_if_user", "  METHODS foo RETURNING VALUE(bar) TYPE zabc_if_types=>ty_bar.\n"),
      intf("zabc_if_types", "  TYPES ty_bar TYPE i.\n"),
    ], ["zabc_if_types", "zabc_if_user"]);
  });

  it("class using a type of another class", () => {
    expectSequence([
      cls("zcl_user", ".\n  PUBLIC SECTION.\n    DATA bar TYPE zcl_types=>ty_bar."),
      cls("zcl_types", ".\n  PUBLIC SECTION.\n    TYPES ty_bar TYPE i."),
    ], ["zcl_types", "zcl_user"]);
  });

  it("interface using a type of a class", () => {
    expectSequence([
      intf("zif_user", "  METHODS foo RETURNING VALUE(bar) TYPE zcl_types=>ty_bar.\n"),
      cls("zcl_types", ".\n  PUBLIC SECTION.\n    TYPES ty_bar TYPE i."),
    ], ["zcl_types", "zif_user"]);
  });

  it("exception class without the cx_ prefix, raised by an interface", () => {
    expectSequence([
      intf("zif_user", "  METHODS foo RAISING zabc_cx_error.\n"),
      cls("zabc_cx_error", " INHERITING FROM cx_static_check."),
    ], ["zabc_cx_error", "zif_user"]);
  });

  it("exception class implementing an interface", () => {
    expectSequence([
      cls("zcx_error", " INHERITING FROM cx_static_check.\n  PUBLIC SECTION.\n    INTERFACES zif_text."),
      intf("zif_text", "  METHODS get RETURNING VALUE(text) TYPE string.\n"),
    ], ["zif_text", "zcx_error"]);
  });

  it("class inheriting from an exception class", () => {
    expectSequence([
      cls("zcl_special", " INHERITING FROM zcx_error."),
      cls("zcx_error", " INHERITING FROM cx_static_check."),
    ], ["zcx_error", "zcl_special"]);
  });

  it("without a dependency: exceptions, interfaces, classes", () => {
    expectSequence([
      cls("zcl_class", "."),
      intf("zif_intf", ""),
      cls("zcx_error", " INHERITING FROM cx_static_check."),
    ], ["zcx_error", "zif_intf", "zcl_class"]);
  });

  it("classes using types of each other are merged anyway", () => {
    const files = [
      cls("zcl_one", ".\n  PUBLIC SECTION.\n    DATA bar TYPE zcl_two=>ty_bar."),
      cls("zcl_two", ".\n  PUBLIC SECTION.\n    DATA bar TYPE zcl_one=>ty_bar."),
    ];
    expect(sequence(files)).to.have.members(["zcl_one", "zcl_two"]);
  });
});
