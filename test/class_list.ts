import * as chai from "chai";
import File from "../src/file";
import FileList from "../src/file_list";
import ClassList from "../src/class_list";

let expect = chai.expect;

describe("classes 1, test", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File(
      "zcl_class.clas.abap",
      "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CLASS-METHODS: blah.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_class IMPLEMENTATION.\n" +
      "  METHOD blah.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS."));

    let classes = new ClassList(files);

    expect(classes.getDeferred().split("\n").length).to.equal(2);
    expect(classes.getDefinitions().split("\n").length).to.equal(5);
    expect(classes.getImplementations().split("\n").length).to.equal(5);
    expect(classes.getResult().split("\n").length).to.equal(10);
  });
});

describe("classes 2, parser error", () => {
  it("something", () => {

    let run = function () {
      let files = new FileList();
      files.push(new File("zcl_class.clas.abap", "foo boo moo"));
      new ClassList(files);
    };

    // eslint-disable-next-line no-invalid-this
    expect(run.bind(this)).to.throw("error parsing class: zcl_class.clas.abap");
  });
});

describe("classes 3, remove public", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File(
      "zcl_class.clas.abap",
      "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CLASS-METHODS: blah.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_class IMPLEMENTATION.\n" +
      "  METHOD blah.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS."));

    let classes = new ClassList(files);

    expect(classes.getDefinitions()).to.have.string("CLASS zcl_class DEFINITION CREATE PUBLIC.");
  });
});

describe("classes 4, exception class", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File(
      "zcx_exception.clas.abap",
      "CLASS zcl_exception DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CLASS-METHODS: blah.\n" +
      "ENDCLASS.\n" +
      "CLASS zcx_exception IMPLEMENTATION.\n" +
      "  METHOD blah.\n" +
      "  ENDMETHOD.\n" +
      "ENDCLASS."));

    let classes = new ClassList(files);

    expect(classes.getExceptions()).to.have.string("CLASS zcx_exception");
  });
});

describe("classes 5, windows newline", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File(
      "zcl_class.clas.abap",
      "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\r\n" +
      "  PUBLIC SECTION.\r\n" +
      "    CLASS-METHODS: blah.\r\n" +
      "ENDCLASS.\r\n" +
      "CLASS zcl_class IMPLEMENTATION.\r\n" +
      "  METHOD blah.\r\n" +
      "  ENDMETHOD.\r\n" +
      "ENDCLASS."));

    let classes = new ClassList(files);

    expect(classes.getDeferred().split("\n").length).to.equal(2);
    expect(classes.getDefinitions().split("\n").length).to.equal(5);
    expect(classes.getImplementations().split("\n").length).to.equal(5);
    expect(classes.getResult().split("\n").length).to.equal(10);
  });
});


describe("classes 6, interface", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File(
      "zif_test.intf.abap",
      "INTERFACE zif_test PUBLIC.\n" +
      "TYPES: ty_type TYPE c LENGTH 6.\n" +
      "ENDINTERFACE."));

    let classes = new ClassList(files);

    expect(classes.getInterfaces().split("\n").length).to.equal(4);
  });
});

describe("classes 7, sequenced by inheritance", () => {
  it("something", () => {
    const file1 = new File(
      "zcl_abapgit_syntax_abap.clas.abap",
      "CLASS zcl_abapgit_syntax_abap DEFINITION\n" +
      "  PUBLIC\n" +
      "  INHERITING FROM zcl_abapgit_syntax_highlighter\n" +
      "  CREATE PUBLIC .\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_abapgit_syntax_abap IMPLEMENTATION.\n" +
      "ENDCLASS.");

    const file2 = new File(
      "zcl_abapgit_syntax_highlighter.clas.abap",
      "CLASS zcl_abapgit_syntax_highlighter DEFINITION\n" +
      "  PUBLIC\n" +
      "  ABSTRACT\n" +
      "  CREATE PUBLIC .\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_abapgit_syntax_highlighter IMPLEMENTATION.\n" +
      "ENDCLASS.");

    let files = [file1, file2];
    let classes = new ClassList(new FileList(files));

    expect(classes.getDefinitions().split("\n")[0].indexOf("CLASS zcl_abapgit_syntax_highlighter")).to.equal(0);

    classes = new ClassList( new FileList(files.reverse()));
    expect(classes.getDefinitions().split("\n")[0].indexOf("CLASS zcl_abapgit_syntax_highlighter")).to.equal(0);
  });
});

describe("classes 8, exceptions sequenced by inheritance", () => {
  it("something", () => {
    const file1 = new File(
      "zcx_abapgit_2fa_unsupported.clas.abap",
      "CLASS zcx_abapgit_2fa_unsupported DEFINITION\n" +
      "  PUBLIC\n" +
      "  INHERITING FROM ZCX_ABAPGIT_2FA_ERROR\n" +
      "  FINAL\n" +
      "  CREATE PUBLIC .\n" +
      "ENDCLASS.\n" +
      "CLASS zcx_abapgit_2fa_unsupported IMPLEMENTATION.\n" +
      "ENDCLASS.");

    const file2 = new File(
      "zcx_abapgit_2fa_error.clas.abap",
      "CLASS zcx_abapgit_2fa_error DEFINITION\n" +
      "  INHERITING FROM CX_STATIC_CHECK\n" +
      "  CREATE PUBLIC .\n" +
      "ENDCLASS.\n" +
      "CLASS zcx_abapgit_2fa_error IMPLEMENTATION.\n" +
      "ENDCLASS.");

    let files = [file1, file2];
    let classes = new ClassList(new FileList(files));

    expect(classes.getExceptions().split("\n")[0].indexOf("CLASS zcx_abapgit_2fa_error")).to.equal(0);

    classes = new ClassList( new FileList(files.reverse()));
    expect(classes.getExceptions().split("\n")[0].indexOf("CLASS zcx_abapgit_2fa_error")).to.equal(0);
  });
});

describe("interfaces 1, dependencies", () => {
  it("something", () => {
    const file1 = new File(
      "zif_intf1.intf.abap",
      "INTERFACE zif_intf1 PUBLIC.\n" +
      "ENDINTERFACE.");

    const file2 = new File(
      "zif_intf2.intf.abap",
      "INTERFACE zif_intf2 PUBLIC.\n" +
      "METHODS read RETURNING VALUE(rt_foo) TYPE zif_intf1=>ty_moo.\n" +
      "METHODS blah RETURNING VALUE(rt_bar) TYPE zif_intf1=>ty_boo.\n" +
      "ENDINTERFACE.");

    let files = [file1, file2];
    let classes = new ClassList(new FileList(files));

    expect(classes.getInterfaces().split("\n")[0].indexOf("INTERFACE zif_intf1.")).to.equal(0);

    classes = new ClassList( new FileList(files.reverse()));
    expect(classes.getInterfaces().split("\n")[0].indexOf("INTERFACE zif_intf1.")).to.equal(0);
  });
});

describe("interfaces 2, reference to self", () => {
  it("something", () => {
    const file1 = new File(
      "zif_intf1.intf.abap",
      "INTERFACE zif_intf1 PUBLIC.\n" +
      "METHODS read RETURNING VALUE(rt_foo) TYPE zif_intf1=>ty_moo.\n" +
      "ENDINTERFACE.");

    let files = [file1];
    let classes = new ClassList(new FileList(files));

    expect(classes.getInterfaces().split("\n")[0].indexOf("INTERFACE zif_intf1.")).to.equal(0);
  });
});

describe("classes, remove PUBLIC, combined with abstract", () => {
  it("something", () => {
    let files = new FileList();

    files.push(new File(
      "zcl_class.clas.abap",
      "CLASS zcl_class DEFINITION ABSTRACT PUBLIC CREATE PUBLIC.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_class IMPLEMENTATION.\n" +
      "ENDCLASS."));

    let classes = new ClassList(files);

    expect(classes.getDefinitions()).to.have.string("CLASS zcl_class DEFINITION ABSTRACT CREATE PUBLIC.");
  });
});
