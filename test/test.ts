import {expect} from "chai";
import Merge from "../src/merge";
import File from "../src/file";
import FileList from "../src/file_list";

describe("test 1, one include", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinclude."));
    files.push(new File("zinclude.abap", "WRITE / 'Hello World!'."));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 2, 2 includes", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\n\n" +
                                      "include zinc1.\n" +
                                      "include zinc2.\n\n" +
                                      "write / 'Main include'."));
    files.push(new File("zinc1.abap", "write / 'hello @inc1'."));
    files.push(new File("zinc2.abap", "write / 'hello @inc2'."));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 3, subinclude", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\n\n" +
                                      "include zinc1.\n" +
                                      "include zinc2.\n\n" +
                                      "write / 'Main include'."));
    files.push(new File("zinc1.abap", "include zsubinc1.\nwrite / 'hello @inc1'."));
    files.push(new File("zinc2.abap", "write / 'hello @inc2'."));
    files.push(new File("zsubinc1.abap", "write / 'hello @inc2'."));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 4, standard include", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\n\n" +
                                      "include zinc1.  \" A comment here\n" +
                                      "include zinc2.\n\n" +
                                      "write / 'Main include'."));
    files.push(new File("zinc1.abap", "include standard.\nwrite / 'hello @inc1'."));
    files.push(new File("zinc2.abap", "write / 'hello @inc2'."));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 5, file not found", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    expect(Merge.merge.bind(Merge, files, "zmain")).to.throw("file not found: zinc1");
  });
});

describe("test 6, not all files used", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("zinc2.abap", "write / 'bar'."));
    expect(Merge.merge.bind(Merge, files, "zmain")).to.throw("Not all files used: [zinc2.abap]");
  });
});

describe("test 7, a unused README.md file", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("README.md", "foobar"));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 8, a unused README.md file", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("README.md", "foobar"));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 9, @@abapmerge commands", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "report zmain.\n" +
                                      "\n" +
                                      "write / 'Main include'.\n" +
                                      "* @@abapmerge include style.css > write '$$'.\n" +
                                      "  \" @@abapmerge include js/script.js > write '$$'.\n" +
                                      "  \" @@abapmerge wrong pragma, just copy to output\n" +
                                      "  \" @@abapmerge include data.txt > write '$$'.\n" +
                                      "  \" @@abapmerge include data.txt > write '$$$'. \" Unescaped !" ));
    files.push(new File("style.css", "body {\nbackground: red;\n}"));
    files.push(new File("data.txt", "content = 'X';\n"));
    files.push(new File("js/script.js", "alert(\"Hello world!\");\n"));
    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a("string");
    expect(result.split("\n").length).to.equal(23);
  });
});

describe("test 10, one include, namespaced", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE /foo/zinclude."));
    files.push(new File("#foo#zinclude.abap", "WRITE / 'Hello World!'."));
    expect(Merge.merge(files, "zmain")).to.be.a("string");
  });
});

describe("test 11, simple class", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(
      new File("zcl_class.clas.abap",
               "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
               "  PUBLIC SECTION.\n" +
               "    CLASS-METHODS: blah.\n" +
               "ENDCLASS.\n" +
               "CLASS zcl_class IMPLEMENTATION.\n" +
               "  METHOD blah.\n" +
               "  ENDMETHOD.\n" +
               "ENDCLASS.\n"));
    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a("string");
    expect(result.split("\n").length).to.equal(17);
  });
});

describe("test 12, @@abapmerge in class", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("style.css", "body {\nbackground: red;\n}"));
    files.push(
      new File("zcl_class.clas.abap",
               "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
               "  PUBLIC SECTION.\n" +
               "    CLASS-METHODS: blah.\n" +
               "ENDCLASS.\n" +
               "CLASS zcl_class IMPLEMENTATION.\n" +
               "  METHOD blah.\n" +
               "* @@abapmerge include style.css > write '$$'.\n" +
               "  ENDMETHOD.\n" +
               "ENDCLASS."));

    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a("string");
    expect(result.indexOf("background")).to.be.above(0);
  });
});

describe("test 13, skip function groups", () => {
  it("skip function groups with skipFUGR", () => {
    let files = new FileList([
      new File("zmain.abap", "REPORT zmain."),
      new File("zabapgit_unit_te.fugr.saplzabapgit_unit_te.abap", "WRITE / 'Hello World!'."),
    ]);
    const merged = Merge.merge(files, "zmain", {skipFUGR: true});
    expect(merged).to.be.a("string");
    expect(merged).not.to.match(/Hello/);
  });

  it("fails on function groups without skipFUGR", () => {
    let files = new FileList([
      new File("zmain.abap", "REPORT zmain."),
      new File("zabapgit_unit_te.fugr.saplzabapgit_unit_te.abap", "WRITE / 'Hello World!'."),
    ]);
    expect(() => Merge.merge(files, "zmain", {skipFUGR: false})).to.throw(/Not all files used.*fugr/);
  });
});

describe("test 14, include classes event without INCLUDE", () => {
  it("include classes event without INCLUDE", () => {
    let files = new FileList();
    files.push(new File("zmain13.prog.abap", "REPORT zmain13.\n" +
                                             "\n" +
                                             "write: 'Hello, world!'.\n"));
    files.push(new File("zcl_main.clas.abap", "class zcl_main defintion.\n" +
                                              "endclass.\n" +
                                              "class zcl_main implementation.\n" +
                                              "endclass.\n"));

    const exp = "REPORT zmain13.\n" +
      "\n" +
      "CLASS zcl_main DEFINITION DEFERRED.\n" +
      "class zcl_main defintion.\n" +
      "endclass.\n" +
      "class zcl_main implementation.\n" +
      "endclass.\n" +
      "\n" +
      "write: 'Hello, world!'.\n";

    let result = Merge.merge(files, "zmain13");

    expect(result).to.equal(exp);
  });
});

describe("test 15, included classes are placed after whitespace and comments", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain13.prog.abap", "REPORT zmain13.\n" +
                                             "* Comment asterisk\n" +
                                             "write: 'Hello, world!'.\n"));

    files.push(new File("zcl_main.clas.abap", "class zcl_main defintion.\n" +
                                              "endclass.\n" +
                                              "class zcl_main implementation.\n" +
                                              "endclass.\n"));

    const exp = "REPORT zmain13.\n" +
      "* Comment asterisk\n" +
      "CLASS zcl_main DEFINITION DEFERRED.\n" +
      "class zcl_main defintion.\n" +
      "endclass.\n" +
      "class zcl_main implementation.\n" +
      "endclass.\n" +
      "\n" +
      "write: 'Hello, world!'.\n";

    let result = Merge.merge(files, "zmain13");

    expect(result).to.equal(exp);
  });
});

describe("test 16, REPORT with LINE-SIZE", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain14.prog.abap", "REPORT zmain14 LINE-SIZE 100.\n" +
                                           "\n" +
                                           "write: 'Hello, world!'.\n"));
    files.push(new File("zcl_main.clas.abap", "class zcl_main defintion.\n" +
                                              "endclass.\n" +
                                              "class zcl_main implementation.\n" +
                                              "endclass.\n"));

    const exp = "REPORT zmain14 LINE-SIZE 100.\n" +
      "\n" +
      "CLASS zcl_main DEFINITION DEFERRED.\n" +
      "class zcl_main defintion.\n" +
      "endclass.\n" +
      "class zcl_main implementation.\n" +
      "endclass.\n" +
      "\n" +
      "write: 'Hello, world!'.\n";

    let result = Merge.merge(files, "zmain14");

    expect(result).to.equal(exp);
  });
});

describe("test 17, included classes are placed after whitespace and comments", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain17.prog.abap", "REPORT zmain17 LINE-SIZE 100.\n" +
                                             "\n" +
                                             "* Comment asterisk\n" +
                                             "* Epic success!\n" +
                                             "\n" +
                                             "write: 'Hello, world!'.\n"));

    files.push(new File("zcl_main.clas.abap", "class zcl_main defintion.\n" +
                                              "endclass.\n" +
                                              "class zcl_main implementation.\n" +
                                              "endclass.\n"));

    const exp = "REPORT zmain17 LINE-SIZE 100.\n" +
      "\n" +
      "* Comment asterisk\n" +
      "* Epic success!\n" +
      "\n" +
      "CLASS zcl_main DEFINITION DEFERRED.\n" +
      "class zcl_main defintion.\n" +
      "endclass.\n" +
      "class zcl_main implementation.\n" +
      "endclass.\n" +
      "\n" +
      "write: 'Hello, world!'.\n";

    let result = Merge.merge(files, "zmain17");

    expect(result).to.equal(exp);
  });
});

describe("test 18, @@abapmerge w/ main no failure", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinc1."));
    files.push(new File("zmain2.prog.abap", "\" @@abapmerge main void\n" +
                                            "REPORT zmain2.\n\nINCLUDE zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));

    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a("string");
  });
});

describe("test 19, @@abapmerge w/o main causes failure", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinc1."));
    files.push(new File("zmain2.prog.abap", "REPORT zmain2.\n\nINCLUDE zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));

    expect(Merge.merge.bind(Merge, files, "zmain")).to.throw("Not all files used: [zmain2.prog.abap]");
  });
});

describe("test 20, abapmerge marker in footer", () => {
  it("abapmerge marker in footer", () => {
    let files = new FileList([
      new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinc1."),
      new File("zinc1.abap", "write / 'foo'."),
    ]);

    let result = Merge.merge(files, "zmain", {
      appendAbapmergeMarker: true,
    });
    expect(result).to.match(/\* abapmerge (?:(\d+\.[.\d]*\d+))/);
    expect(result).to.match(/^INTERFACE lif_abapmerge_marker\.$/m);
  });
});

describe("test 21, interface defintion should not cross 2 lines", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\nINCLUDE zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("zif_foo.intf.abap", "INTERFACE zif_foo\n    PUBLIC.\nENDINTERFACE."));
    const result = Merge.merge(files, "zmain");
    const split = result.split("\n");
    expect(result).to.be.a("string");
    expect(split.indexOf("REPORT zmain.")).to.equal(0);
    expect(split.indexOf("INTERFACE zif_foo DEFERRED.")).to.equal(1);
    expect(split.indexOf("INTERFACE zif_foo.")).to.equal(2);
  });
});

describe("test 22, interface with comment", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain.\nINCLUDE zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("zif_foo.intf.abap", "* some comment\nINTERFACE zif_foo\n    PUBLIC.\nENDINTERFACE."));
    const result = Merge.merge(files, "zmain");
    const split = result.split("\n");
    expect(result).to.be.a("string");
    expect(split.indexOf("REPORT zmain.")).to.equal(0);
    expect(split.indexOf("INTERFACE zif_foo DEFERRED.")).to.equal(1);
    expect(split.indexOf("INTERFACE zif_foo.")).to.equal(2);
  });
});

describe("test 23, replace report clause name by options", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain."));
    const result = Merge.merge(files, "zmain", {newReportName: "zmain_test"});
    const split = result.split("\n");
    expect(result).to.be.a("string");
    expect(split.indexOf("REPORT zmain_test.")).to.equal(0);
  });
});

describe("test 24, replace report clause name by options with LINE-SIZE", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("zmain.abap", "REPORT zmain LINE-SIZE 100."));
    const result = Merge.merge(files, "zmain", {newReportName: "zmain_test"});
    const split = result.split("\n");
    expect(result).to.be.a("string");
    expect(split.indexOf("REPORT zmain_test LINE-SIZE 100.")).to.equal(0);
  });
});

describe("test 25, replace report clause name by options when report name has namespace", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("#prod#main.abap", "REPORT /prod/main."));
    const result = Merge.merge(files, "#prod#main", {newReportName: "/prod/main_test"});
    const split = result.split("\n");
    expect(result).to.be.a("string");
    expect(split.indexOf("REPORT /prod/main_test.")).to.equal(0);
  });
});
