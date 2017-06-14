import * as chai from "chai";
import Merge from "../src/merge";
import File from "../src/file";

let expect = chai.expect;

// todo: test @@abapmerge include command - node abapmerge ./test/abap/5/zmain.abap

describe("test 1, one include", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "REPORT zmain.\n\nINCLUDE zinclude."));
    files.push(new File("zinclude.abap", "WRITE / 'Hello World!'."));
    expect(Merge.merge(files, "zmain")).to.be.a('string');
  });
});

describe("test 2, 2 includes", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "report zmain.\n\ninclude zinc1.\ninclude zinc2.\n\nwrite / 'Main include'."));
    files.push(new File("zinc1.abap", "write / 'hello @inc1'."));
    files.push(new File("zinc2.abap", "write / 'hello @inc2'."));
    expect(Merge.merge(files, "zmain")).to.be.a('string');
  });
});

describe("test 3, subinclude", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "report zmain.\n\ninclude zinc1.\ninclude zinc2.\n\nwrite / 'Main include'."));
    files.push(new File("zinc1.abap", "include zsubinc1.\nwrite / 'hello @inc1'."));
    files.push(new File("zinc2.abap", "write / 'hello @inc2'."));
    files.push(new File("zsubinc1.abap", "write / 'hello @inc2'."));
    expect(Merge.merge(files, "zmain")).to.be.a('string');
  });
});

describe("test 4, standard include", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "report zmain.\n\ninclude zinc1.  \" A comment here\ninclude zinc2.\n\nwrite / 'Main include'."));
    files.push(new File("zinc1.abap", "include standard.\nwrite / 'hello @inc1'."));
    files.push(new File("zinc2.abap", "write / 'hello @inc2'."));
    expect(Merge.merge(files, "zmain")).to.be.a('string');
  });
});

describe("test 5, file not found", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    expect(Merge.merge.bind(Merge, files, "zmain")).to.throw("file not found: zinc1");
  });
});

describe("test 6, not all files used", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("zinc2.abap", "write / 'bar'."));
    expect(Merge.merge.bind(Merge, files, "zmain")).to.throw("Not all files used: [zinc2]");
  });
});

describe("test 7, a README.md file", () => {
  it("something", () => {
    let files: File[] = [];
    files.push(new File("zmain.abap", "report zmain.\ninclude zinc1."));
    files.push(new File("zinc1.abap", "write / 'foo'."));
    files.push(new File("README.md", "foobar"));
    expect(Merge.merge(files, "zmain")).to.be.a('string');
  });
});