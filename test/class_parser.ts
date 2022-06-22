import * as chai from "chai";
import File from "../src/file";
import FileList from "../src/file_list";
import {ClassParser, AbapPublicClass} from "../src/class_parser";

let expect = chai.expect;

describe("class_parser 1, anonymizeTypeName contract", () => {
  it("something", () => {
    let prefix = "prefix";
    let alias = ClassParser.anonymizeTypeName(prefix, "type", "name");

    let anotherprefix = "foobar";
    let anotheralias = ClassParser.anonymizeTypeName(anotherprefix, "type", "name");

    expect(alias.length).to.equal(15 + prefix.length);
    expect(alias.substr(5, prefix.length)).to.equal(prefix);
    expect(alias.substr(0, 5)).to.equal(anotheralias.substr(0, 5));
    expect(alias.substring(5 + prefix.length + 1, alias.length - 1)).to.equal(
      anotheralias.substring(5 + anotherprefix.length + 1, anotheralias.length - 1));
  });
});

describe("class_parser 2, renameLocalType class member", () => {
  it("something", () => {
    let oldCode = "data(res) = cl_foo=>do_stuff().";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_bar", "cl_parent", oldCode);
    expect(newCode).to.equal("data(res) = cl_bar=>do_stuff().");
  });
});

describe("class_parser 3, renameLocalType new", () => {
  it("something", () => {
    let oldCode = "data(res) = new cl_foo( ).";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_bar", "cl_parent", oldCode);
    expect(newCode).to.equal("data(res) = new cl_bar( ).");
  });
});

describe("class_parser 4, renameLocalType ref to", () => {
  it("something", () => {
    let oldCode = "data: res type ref to cl_foo.";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_bar", "cl_parent", oldCode);
    expect(newCode).to.equal("data: res type ref to cl_bar.");
  });
});

describe("class_parser 5, renameLocalType class definition", () => {
  it("something", () => {
    let oldCode = "class cl_foo definition.";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_bar", "cl_parent", oldCode);
    expect(newCode).to.equal("* renamed: cl_parent :: cl_foo\n" +
                             "class cl_bar definition.");
  });
});

describe("class_parser 6, renameLocalType class implementation", () => {
  it("something", () => {
    let oldCode = "class cl_foo implementation.";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_bar", "cl_parent", oldCode);
    expect(newCode).to.equal("class cl_bar implementation.");
  });
});

describe("class_parser 7, renameLocalType interface declaration", () => {
  it("something", () => {
    let oldCode = "interface lif_foo.\nclass lcl_imp definition.\ninterfaces lif_foo.\nendclass.\n";
    let newCode = ClassParser.renameLocalType("lif_foo", "lif_bar", "cl_parent", oldCode);

    expect(newCode).to.equal("* renamed: cl_parent :: lif_foo\n" +
                             "interface lif_bar.\n" +
                             "class lcl_imp definition.\ninterfaces lif_bar.\nendclass.\n");
  });
});

describe("class_parser 8, buildLocalFileName imp", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";

    let filename = ClassParser.buildLocalFileName("imp", abapClass);

    expect(filename).to.equal("cl_foo.clas.locals_imp.abap");
  });
});

describe("class_parser 9, buildLocalFileName def", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";

    let filename = ClassParser.buildLocalFileName("def", abapClass);

    expect(filename).to.equal("cl_foo.clas.locals_def.abap");
  });
});

describe("class_parser 10, parseLocalContents contract class", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.hash = "XOX";
    abapClass.def = "lcl_def=>def_imp";
    abapClass.imp = "lcl_def=>def_imp lcl_imp=>imp_only";

    let oldLocalDef = "class lcl_def definition.";
    let oldLocalImp = "class lcl_imp definition.";

    ClassParser.parseLocalContents("imp", abapClass, oldLocalImp);

    expect(abapClass.def).to.equal("lcl_def=>def_imp");
    expect(abapClass.imp).to.equal("class GiiGhXOXVndeoIopfZ DEFINITION DEFERRED.\n" +
                                   "* renamed: cl_foo :: lcl_imp\n" +
                                   "class GiiGhXOXVndeoIopfZ definition.\n" +
                                   "lcl_def=>def_imp GiiGhXOXVndeoIopfZ=>imp_only");

    ClassParser.parseLocalContents("def", abapClass, oldLocalDef);

    expect(abapClass.def).to.equal("class GiiGhXOXPMwTAnXjaE DEFINITION DEFERRED.\n" +
                                   "* renamed: cl_foo :: lcl_def\n" +
                                   "class GiiGhXOXPMwTAnXjaE definition.\n" +
                                   "GiiGhXOXPMwTAnXjaE=>def_imp");
    expect(abapClass.imp).to.equal("class GiiGhXOXVndeoIopfZ DEFINITION DEFERRED.\n" +
                                   "* renamed: cl_foo :: lcl_imp\n" +
                                   "class GiiGhXOXVndeoIopfZ definition.\n" +
                                   "GiiGhXOXPMwTAnXjaE=>def_imp GiiGhXOXVndeoIopfZ=>imp_only");
  });
});

describe("class_parser 11, parseLocalContents contract interface", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.hash = "XOX";
    abapClass.def = "lif_def=>def_imp";
    abapClass.imp = "lif_def=>def_imp lif_imp=>imp_only";

    let oldLocalDef = "interface lif_def.";
    let oldLocalImp = "interface lif_imp.";

    ClassParser.parseLocalContents("imp", abapClass, oldLocalImp);

    expect(abapClass.def).to.equal("lif_def=>def_imp");
    expect(abapClass.imp).to.equal("interface WboRqXOXAKOYzxghOo DEFERRED.\n" +
                                   "* renamed: cl_foo :: lif_imp\n" +
                                   "interface WboRqXOXAKOYzxghOo.\n" +
                                   "lif_def=>def_imp WboRqXOXAKOYzxghOo=>imp_only");

    ClassParser.parseLocalContents("def", abapClass, oldLocalDef);

    expect(abapClass.def).to.equal("interface WboRqXOXujgMLcQaJU DEFERRED.\n" +
                                   "* renamed: cl_foo :: lif_def\n" +
                                   "interface WboRqXOXujgMLcQaJU.\n" +
                                   "WboRqXOXujgMLcQaJU=>def_imp");
    expect(abapClass.imp).to.equal("interface WboRqXOXAKOYzxghOo DEFERRED.\n" +
                                   "* renamed: cl_foo :: lif_imp\n" +
                                   "interface WboRqXOXAKOYzxghOo.\n" +
                                   "WboRqXOXujgMLcQaJU=>def_imp WboRqXOXAKOYzxghOo=>imp_only");
  });
});

describe("class_parser 12, parseLocalContents comments", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.hash = "_XOX_";
    abapClass.def = "";
    abapClass.imp = "";

    let oldLocalImp = "* interface foo definition.\n" +
                      "class utils definition.\n";

    ClassParser.parseLocalContents("imp", abapClass, oldLocalImp);

    expect(abapClass.def).to.equal("");
    expect(abapClass.imp).to.equal("class GiiGh_XOX_QFKeljuxmY DEFINITION DEFERRED.\n" +
                                   "* interface foo definition.\n" +
                                   "* renamed: cl_foo :: utils\n" +
                                   "class GiiGh_XOX_QFKeljuxmY definition.\n\n");
  });
});

describe("class_parser 13, findFileByName", () => {
  it("something", () => {
    let files = new FileList();
    files.push(new File("camelCASEfile", "camelCASEfile"));
    files.push(new File("INVERTEDcaseFILE", "INVERTEDcaseFILE"));

    expect(ClassParser.findFileByName("CAMELcaseFILE", files).getContents()).to.equal("camelCASEfile");
    expect(ClassParser.findFileByName("invertedCASEfile", files).getContents()).to.equal("INVERTEDcaseFILE");
  });
});

describe("class_parser 14, tryProcessLocalFile not found imp", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.def = "";
    abapClass.imp = "";

    let mainFile = new File("cl_foo.clas.abap", "class cl_foo definition.");
    let defFile = new File("cl_foo.clas.locals_def.abap", "interface lif_bar.");
    let files = new FileList();
    files.push(mainFile);
    files.push(defFile);

    ClassParser.tryProcessLocalFile("imp", abapClass, files);

    expect(mainFile.wasUsed()).to.equal(false);
    expect(defFile.wasUsed()).to.equal(false);

    expect(abapClass.def).to.equal("");
    expect(abapClass.imp).to.equal("");
  });
});

describe("class_parser 15, tryProcessLocalFile not found def", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.def = "";
    abapClass.imp = "";

    let mainFile = new File("cl_foo.clas.abap", "class cl_foo definition.");
    let impFile = new File("cl_foo.clas.locals_imp.abap", "class lcl_bar definition.");
    let files = new FileList();
    files.push(mainFile);

    ClassParser.tryProcessLocalFile("def", abapClass, files);

    expect(mainFile.wasUsed()).to.equal(false);
    expect(impFile.wasUsed()).to.equal(false);

    expect(abapClass.def).to.equal("");
    expect(abapClass.imp).to.equal("");
  });
});

describe("class_parser 16, tryProcessLocalFile unknown", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.def = "";
    abapClass.imp = "";

    let mainFile = new File("cl_foo.clas.abap", "class cl_foo definition.");
    let defFile = new File("cl_foo.clas.locals_def.abap", "interface lif_blah.");
    let impFile = new File("cl_foo.clas.locals_imp.abap", "class lcl_bar definition.");
    let files = new FileList();
    files.push(mainFile);
    files.push(defFile);
    files.push(impFile);

    ClassParser.tryProcessLocalFile("omg", abapClass, files);

    expect(mainFile.wasUsed()).to.equal(false);
    expect(defFile.wasUsed()).to.equal(false);
    expect(impFile.wasUsed()).to.equal(false);

    expect(abapClass.def).to.equal("");
    expect(abapClass.imp).to.equal("");
  });
});

describe("class_parser 17, tryProcessLocalFile found", () => {
  it("something", () => {
    let abapClass = new AbapPublicClass();
    abapClass.name = "cl_foo";
    abapClass.def = "";
    abapClass.imp = "";

    let mainFile = new File("cl_foo.clas.abap", "class cl_foo definition.");
    let defFile = new File("cl_foo.clas.locals_def.abap", "* comment def");
    let impFile = new File("cl_foo.clas.locals_imp.abap", "* comment imp");
    let files = new FileList();
    files.push(mainFile);
    files.push(defFile);
    files.push(impFile);

    ClassParser.tryProcessLocalFile("imp", abapClass, files);

    expect(mainFile.wasUsed()).to.equal(false);
    expect(defFile.wasUsed()).to.equal(false);
    expect(impFile.wasUsed()).to.equal(true);

    expect(abapClass.def).to.equal("");
    expect(abapClass.imp).to.equal("* comment imp\n");

    ClassParser.tryProcessLocalFile("def", abapClass, files);

    expect(mainFile.wasUsed()).to.equal(false);
    expect(defFile.wasUsed()).to.equal(true);
    expect(impFile.wasUsed()).to.equal(true);

    expect(abapClass.def).to.equal("* comment def\n");
    expect(abapClass.imp).to.equal("* comment imp\n");
  });
});

describe("class_parser 19, renameLocalType exception in catch with into", () => {
  it("something", () => {
    let oldCode = "catch cl_foo cl_bar into";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);
    expect(newCode).to.equal("catch cl_new cl_bar into");

    let newCode2 = ClassParser.renameLocalType("cl_bar", "cl_future", "cl_parent", newCode);
    expect(newCode2).to.equal("catch cl_new cl_future into");
  });
});

describe("class_parser 20, renameLocalType exception in catch w/o into", () => {
  it("something", () => {
    let oldCode = "catch cl_foo cl_bar.";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);
    expect(newCode).to.equal("catch cl_new cl_bar.");

    let newCode2 = ClassParser.renameLocalType("cl_bar", "cl_future", "cl_parent", newCode);
    expect(newCode2).to.equal("catch cl_new cl_future.");
  });
});

describe("class_parser 21, renameLocalType exception in catch before unwind with into", () => {
  it("something", () => {
    let oldCode = "catch cl_foo cl_bar into";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);
    expect(newCode).to.equal("catch cl_new cl_bar into");

    let newCode2 = ClassParser.renameLocalType("cl_bar", "cl_future", "cl_parent", newCode);
    expect(newCode2).to.equal("catch cl_new cl_future into");
  });
});

describe("class_parser 22, renameLocalType exception in catch before unwind w/o into", () => {
  it("something", () => {
    let oldCode = "catch cl_foo cl_bar.";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);
    expect(newCode).to.equal("catch cl_new cl_bar.");

    let newCode2 = ClassParser.renameLocalType("cl_bar", "cl_future", "cl_parent", newCode);
    expect(newCode2).to.equal("catch cl_new cl_future.");
  });
});

describe("class_parser 23, renameLocalType exception in raising", () => {
  it("something", () => {
    let oldCode = "raising cl_foo resumable(cl_bar).";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);
    expect(newCode).to.equal("raising cl_new resumable(cl_bar).");

    let newCode2 = ClassParser.renameLocalType("cl_bar", "cl_future", "cl_parent", newCode);
    expect(newCode2).to.equal("raising cl_new resumable(cl_future).");
  });
});

describe("class_parser 24, renameLocalType no rename in asterisk comments", () => {
  it("something", () => {
    let oldCode = "* The class cl_foo does the hard work";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);

    expect(newCode).to.equal("* The class cl_foo does the hard work");
  });
});

describe("class_parser 25, renameLocalType no rename in double quote comments", () => {
  it("something", () => {
    let oldCode = "lo_inst = cl_foo=>instance( ). \" cache singletone inst of cl_foo";
    let newCode = ClassParser.renameLocalType("cl_foo", "cl_new", "cl_parent", oldCode);

    expect(newCode).to.equal("lo_inst = cl_new=>instance( ). \" cache singletone inst of cl_foo");
  });
});

describe("class_parser 26, renameLocalType interfaces in class definition", () => {
  it("something", () => {
    let oldCode = "class cl_parent definition.\n  public section.\n    interfaces lif_foo.\n";
    let newCode = ClassParser.renameLocalType("lif_foo", "lif_renamed", "cl_parent", oldCode);

    expect(newCode).to.equal("class cl_parent definition.\n  public section.\n    interfaces lif_renamed.\n");
  });
});

describe("class_parser 27, renameLocalType interface in method implementation", () => {
  it("something", () => {
    let oldCode = "class cl_parent implementation.\n  method lif_foo~do.\n  endmethod.\n";
    let newCode = ClassParser.renameLocalType("lif_foo", "lif_renamed", "cl_parent", oldCode);

    expect(newCode).to.equal("class cl_parent implementation.\n  method lif_renamed~do.\n  endmethod.\n");
  });
});

describe("class_parser 28, the method parse", () => {
  it("processes all files", () => {
    let mainFile = new File(
      "cl_parent.clas.abap",
      "class cl_parent definition.\n" +
      "private section.\n" +
      "data: mo_impl typ ref to lif_impl.\n" +
      "endclass.\n" +
      "class cl_parent implementation.\n" +
      "method constructor.\n" +
      "mo_impl = cast lif_impl(new lcl_impl_prod( )).\n" +
      "endmethod.\n" +
      "endclass.\n");

    let defFile = new File(
      "cl_parent.clas.locals_def.abap",
      "interface lif_impl.\nendinterface.\n" +
      "class lcl_impl_base definition.\n" +
      "interfaces lif_impl.\n" +
      "endclass.\n");

    let impFile = new File(
      "cl_parent.clas.locals_imp.abap",
      "class lcl_impl_prod definition inheriting from lcl_impl_base.\n" +
      "public section.\n" +
      "interfaces lif_impl.\n" +
      "endclass.\n");

    let files = new FileList();

    files.push(mainFile);
    files.push(defFile);
    files.push(impFile);

    let abapClass = ClassParser.parse(mainFile, files);

    expect(abapClass.getDefinition()).to.equal(
      "class GiiGhQvMEsAOOpdApbtQhfRrLQpNLF DEFINITION DEFERRED.\n" +
      "interface WboRqQvMEsAOOpdApbtQPWHIIjHuMM DEFERRED.\n" +
      "* renamed: cl_parent :: lif_impl\n" +
      "interface WboRqQvMEsAOOpdApbtQPWHIIjHuMM.\n" +
      "endinterface.\n" +
      "* renamed: cl_parent :: lcl_impl_base\n" +
      "class GiiGhQvMEsAOOpdApbtQhfRrLQpNLF definition.\n" +
      "interfaces WboRqQvMEsAOOpdApbtQPWHIIjHuMM.\n" +
      "endclass.\n\n" +
      "class cl_parent definition.\n" +
      "private section.\n" +
      "data: mo_impl typ ref to WboRqQvMEsAOOpdApbtQPWHIIjHuMM.\n" +
      "endclass.");

    expect(abapClass.getImplementation()).to.equal(
      "class GiiGhQvMEsAOOpdApbtQvMjIdUypid DEFINITION DEFERRED.\n* renamed: cl_parent :: lcl_impl_prod\n" +
      "class GiiGhQvMEsAOOpdApbtQvMjIdUypid definition inheriting from GiiGhQvMEsAOOpdApbtQhfRrLQpNLF.\n" +
      "public section.\ninterfaces WboRqQvMEsAOOpdApbtQPWHIIjHuMM.\nendclass.\n\n" +
      "class cl_parent implementation.\nmethod constructor.\n" +
      "mo_impl = cast WboRqQvMEsAOOpdApbtQPWHIIjHuMM(new GiiGhQvMEsAOOpdApbtQvMjIdUypid( )).\n" +
      "endmethod.\nendclass.\n");
  });
});

describe("class_parser 29, multi occurrence on line", () => {
  it.only("processes all files", () => {
    let mainFile = new File(
      "cl_parent.clas.abap",
      `
class cl_parent definition.
endclass.
class cl_parent implementation.
  method constructor.
    CASE foo.
      WHEN lif_kind=>bar OR lif_kind=>bar.
    ENDCASE.
  endmethod.
endclass.`);

    let defFile = new File(
      "cl_parent.clas.locals_def.abap",
      `
interface lif_kind.
  constants bar type c length 1 value 'A'.
endinterface.`);

    let files = new FileList();

    files.push(mainFile);
    files.push(defFile);

    let abapClass = ClassParser.parse(mainFile, files);

    expect(abapClass.getImplementation()).to.equal(`class cl_parent implementation.
  method constructor.
    CASE foo.
      WHEN WboRqQvMEsAOOpdApbtQdAMURRqLkF=>bar OR WboRqQvMEsAOOpdApbtQdAMURRqLkF=>bar.
    ENDCASE.
  endmethod.
endclass.`);

  });
});
