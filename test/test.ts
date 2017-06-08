import * as chai from "chai";
import Merge from "../src/merge";
import File from "../src/file";

let expect = chai.expect;

// todo: test "file not found"
// todo: test "not all files used"
// todo: test @@abapmerge include command - node abapmerge ./test/abap/5/zmain.abap

describe("test 1, one include", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain", "REPORT zmain.\n\nINCLUDE zinclude."));
    files.push(new File("zinclude", "WRITE / 'Hello World!'."));
    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a('string');
  });
});

describe("test 2, 2 includes", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain", "report zmain.\n\ninclude zinc1.\ninclude zinc2.\n\nwrite / 'Main include'."));
    files.push(new File("zinc1", "write / 'hello @inc1'."));
    files.push(new File("zinc2", "write / 'hello @inc2'."));
    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a('string');
  });
});

describe("test 3, subinclude", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain", "report zmain.\n\ninclude zinc1.\ninclude zinc2.\n\nwrite / 'Main include'."));
    files.push(new File("zinc1", "include zsubinc1.\nwrite / 'hello @inc1'."));
    files.push(new File("zinc2", "write / 'hello @inc2'."));
    files.push(new File("zsubinc1", "write / 'hello @inc2'."));
    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a('string');
  });
});

describe("test 4, standard include", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain", "report zmain.\n\ninclude zinc1.  \" A comment here\ninclude zinc2.\n\nwrite / 'Main include'."));
    files.push(new File("zinc1", "include standard.\nwrite / 'hello @inc1'."));
    files.push(new File("zinc2", "write / 'hello @inc2'."));
    let result = Merge.merge(files, "zmain");
    expect(result).to.be.a('string');
  });
});