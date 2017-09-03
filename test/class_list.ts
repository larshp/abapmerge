import * as chai from "chai";
import File from "../src/file";
import ClassList from "../src/class_list";

let expect = chai.expect;

describe("classes 1, test", () => {
  it("something", () => {
    let classes = new ClassList();

    classes.push(new File("zcl_class.clas.abap",
      "CLASS zcl_class DEFINITION PUBLIC CREATE PUBLIC.\n" +
      "  PUBLIC SECTION.\n" +
      "    CLASS-METHODS: blah.\n" +
      "ENDCLASS.\n" +
      "CLASS zcl_class IMPLEMENTATION.\n" +
      "  METHOD bits_to_int.\n" +
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

    var run = function () {
      let classes = new ClassList();
      classes.push(new File("zcl_class.clas.abap", "foo boo moo"));
    }

    expect(run.bind(this)).to.throw("error parsing class: zcl_class.clas.abap");
  });
});