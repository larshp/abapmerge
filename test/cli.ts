import * as chai from "chai";
import { Logic } from "../src/cli";
import { join } from "path";

let expect = chai.expect;

let stderr;
let args: string[];

describe("CLI parse arguments", () => {

  beforeEach(() => {
    args = ["node_path", "abapmerge"];
  });

  it("no arguments", () => {
    expect(() => Logic.parseArgs(args)).to.throw("Specify entrypoint file name");
  });

  it("too many entry points", () => {
    args.push("entrypoint_1");
    args.push("entrypoint_2");
    expect(() => Logic.parseArgs(args)).to.throw("Specify just one entrypoint");
  });

  it.skip("entrypoint file does not exist", () => {
    // skip, file existence check moved to `run`, proper implemention would suppose memfs or similar
    args.push("entrypoint_1");
    expect(() => Logic.parseArgs(args)).to.throw("File \"entrypoint_1\" does not exist");
  });

  it("entrypoint existing file", () => {
    args.push(join(__dirname, "entry.abap"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "entry.abap",
      skipFUGR: false,
      noFooter: false,
      newReportName: undefined,
      outputFile: undefined,
      runPreProcessorOnly: false,
    };
    chai.assert.isNotNull(parsedArgs);
    chai.assert.deepEqual(parsedArgs, parsedArgsExpected);
  });

  it("skipFugr option", () => {
    args.push("-f");
    args.push(join(__dirname, "entry.abap"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "entry.abap",
      skipFUGR: true,
      noFooter: false,
      newReportName: undefined,
      outputFile: undefined,
      runPreProcessorOnly: false,
    };
    chai.assert.isNotNull(parsedArgs);
    chai.assert.deepEqual(parsedArgs, parsedArgsExpected);
  });

  it("noFooter option", () => {
    args.push("-f");
    args.push("--without-footer");
    args.push(join(__dirname, "entry.abap"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "entry.abap",
      skipFUGR: true,
      noFooter: true,
      newReportName: undefined,
      outputFile: undefined,
      runPreProcessorOnly: false,
    };
    chai.assert.isNotNull(parsedArgs);
    chai.assert.deepEqual(parsedArgs, parsedArgsExpected);
  });

  it("newReportName option", () => {
    args.push("-f");
    args.push("--without-footer");
    args.push("-c");
    args.push("znewname");
    args.push(join(__dirname, "entry.abap"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "entry.abap",
      skipFUGR: true,
      noFooter: true,
      newReportName: "znewname",
      outputFile: undefined,
      runPreProcessorOnly: false,
    };
    chai.assert.isNotNull(parsedArgs);
    chai.assert.deepEqual(parsedArgs, parsedArgsExpected);
  });

  it("outputFile option", () => {
    args.push("-o");
    args.push("some.file");
    args.push(join(__dirname, "entry.abap"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "entry.abap",
      skipFUGR: false,
      noFooter: false,
      newReportName: undefined,
      outputFile: "some.file",
      runPreProcessorOnly: false,
    };
    chai.assert.isNotNull(parsedArgs);
    chai.assert.deepEqual(parsedArgs, parsedArgsExpected);
  });
});

function captureStream(stream) {
  let oldWrite = stream.write;
  let buf = "";
  stream.write = function(chunk) {
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook() {
      stream.write = oldWrite;
    },
    captured: function() {
      return buf;
    },
  };
}

describe("Logic Run", () => {
  beforeEach(() => {
    args = ["node_path", "abapmerge"];
    stderr = captureStream(process.stderr);
  });

  it("entrypoint file name error", () => {
    Logic.run(args);
    expect(stderr.captured()).equal("error: missing required argument 'entrypoint'\nSpecify entrypoint file name");
  });
});
