import * as chai from "chai";
import File from "../src/file";
import ClassList from "../src/class_list";

let expect = chai.expect;

describe("classes 1, test", () => {
  it("something", () => {
    let classes = new ClassList();

    classes.pushClass(
      new File("zcl_class.clas.abap",
               "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
               "  PUBLIC SECTION.\n" +
               "    CLASS-METHODS: blah.\n" +
               "ENDCLASS.\n" +
               "CLASS zcl_class IMPLEMENTATION.\n" +
               "  METHOD blah.\n" +
               "  ENDMETHOD.\n" +
               "ENDCLASS."));

    expect(classes.getDeferred().split("\n").length).to.equal(2);
    expect(classes.getDefinitions().split("\n").length).to.equal(5);
    expect(classes.getImplementations().split("\n").length).to.equal(5);
    expect(classes.getResult().split("\n").length).to.equal(10);
  });
});

describe("classes 2, parser error", () => {
  it("something", () => {

    let run = function () {
      let classes = new ClassList();
      classes.pushClass(new File("zcl_class.clas.abap", "foo boo moo"));
    };

// tslint:disable-next-line:no-invalid-this
    expect(run.bind(this)).to.throw("error parsing class: zcl_class.clas.abap");
  });
});

describe("classes 3, remove public", () => {
  it("something", () => {
    let classes = new ClassList();

    classes.pushClass(
      new File("zcl_class.clas.abap",
               "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
               "  PUBLIC SECTION.\n" +
               "    CLASS-METHODS: blah.\n" +
               "ENDCLASS.\n" +
               "CLASS zcl_class IMPLEMENTATION.\n" +
               "  METHOD blah.\n" +
               "  ENDMETHOD.\n" +
               "ENDCLASS."));

    expect(classes.getDefinitions()).to.have.string("CLASS zcl_class DEFINITION CREATE PUBLIC.");
  });
});

describe("classes 4, exception class", () => {
  it("something", () => {
    let classes = new ClassList();

    classes.pushClass(
      new File("zcx_exception.clas.abap",
               "CLASS zcl_exception DEFINITION PUBLIC CREATE PUBLIC.\n" +
               "  PUBLIC SECTION.\n" +
               "    CLASS-METHODS: blah.\n" +
               "ENDCLASS.\n" +
               "CLASS zcx_exception IMPLEMENTATION.\n" +
               "  METHOD blah.\n" +
               "  ENDMETHOD.\n" +
               "ENDCLASS."));

    expect(classes.getExceptions()).to.have.string("CLASS zcx_exception");
  });
});

describe("classes 5, windows newline", () => {
  it("something", () => {
    let classes = new ClassList();

    classes.pushClass(
      new File("zcl_class.clas.abap",
               "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\r\n" +
               "  PUBLIC SECTION.\r\n" +
               "    CLASS-METHODS: blah.\r\n" +
               "ENDCLASS.\r\n" +
               "CLASS zcl_class IMPLEMENTATION.\r\n" +
               "  METHOD blah.\r\n" +
               "  ENDMETHOD.\r\n" +
               "ENDCLASS."));

    expect(classes.getDeferred().split("\n").length).to.equal(2);
    expect(classes.getDefinitions().split("\n").length).to.equal(5);
    expect(classes.getImplementations().split("\n").length).to.equal(5);
    expect(classes.getResult().split("\n").length).to.equal(10);
  });
});


describe("classes 6, interface", () => {
  it("something", () => {
    let classes = new ClassList();

    classes.pushInterface(
      new File("zif_test.intf.abap",
               "INTERFACE zif_test PUBLIC.\n" +
               "TYPES: ty_type TYPE c LENGTH 6.\n" +
               "ENDINTERFACE."));

    expect(classes.getInterfaces().split("\n").length).to.equal(3);
  });
});


describe("classes 7, sequenced by inheritance", () => {
  it("something", () => {
    let classes = new ClassList();
    classes.pushClass(
      new File("zcl_abapgit_syntax_abap.clas.abap",
               "CLASS zcl_abapgit_syntax_abap DEFINITION\n" +
               "  PUBLIC\n" +
               "  INHERITING FROM zcl_abapgit_syntax_highlighter\n" +
               "  CREATE PUBLIC .\n" +
               "ENDCLASS.\n" +
               "CLASS zcl_abapgit_syntax_abap IMPLEMENTATION.\n" +
               "ENDCLASS."));

    classes.pushClass(
      new File("zcl_abapgit_syntax_highlighter.clas.abap",
               "CLASS zcl_abapgit_syntax_highlighter DEFINITION\n" +
               "  PUBLIC\n" +
               "  ABSTRACT\n" +
               "  CREATE PUBLIC .\n" +
               "ENDCLASS.\n" +
               "CLASS zcl_abapgit_syntax_highlighter IMPLEMENTATION.\n" +
               "ENDCLASS."));

    expect(classes.getDefinitions().split("\n")[0].indexOf("CLASS zcl_abapgit_syntax_highlighter")).to.equal(0);
  });
});
