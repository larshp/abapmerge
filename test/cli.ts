import * as chai from "chai";
import { Logic } from "../src/cli";

let expect = chai.expect;

let args:string[];

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

  it("entrypoint file does not exist", () => {
    args.push("entrypoint_1");
    expect(() => Logic.parseArgs(args)).to.throw("File \"entrypoint_1\" does not exist");
  });

  it("entrypoint existing file", () => {
    args.push(__dirname.concat("/cli.js"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "cli.js",
      entryObjectName: "cli",
      skipFUGR: false,
      noFooter: false,
      newReportName: undefined
    }
    expect(parsedArgs).to.be.not.null;
    expect(parsedArgs).eql(parsedArgsExpected);
  });

  it("skipFugr option", () => {
    args.push("-f");
    args.push(__dirname.concat("/cli.js"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "cli.js",
      entryObjectName: "cli",
      skipFUGR: true,
      noFooter: false,
      newReportName: undefined
    }
    expect(parsedArgs).to.be.not.null;
    expect(parsedArgs).eql(parsedArgsExpected);
  });

  it("noFooter option", () => {
    args.push("-f");
    args.push("--without-footer");
    args.push(__dirname.concat("/cli.js"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "cli.js",
      entryObjectName: "cli",
      skipFUGR: true,
      noFooter: true,
      newReportName: undefined
    }
    expect(parsedArgs).to.be.not.null;
    expect(parsedArgs).eql(parsedArgsExpected);
  });

  it("newReportName option", () => {
    args.push("-f");
    args.push("--without-footer");
    args.push("-c");
    args.push("znewname");
    args.push(__dirname.concat("/cli.js"));
    let parsedArgs = Logic.parseArgs(args);
    let parsedArgsExpected = {
      entryDir: __dirname,
      entryFilename: "cli.js",
      entryObjectName: "cli",
      skipFUGR: true,
      noFooter: true,
      newReportName: "znewname"
    }
    expect(parsedArgs).to.be.not.null;
    expect(parsedArgs).eql(parsedArgsExpected);
  });
});

function captureStream(stream){
  var oldWrite = stream.write;
  var buf = '';
  stream.write = function(chunk){
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  }

  return {
    unhook: function unhook(){
     stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    }
  };
}

let stderr;

describe("Logic Run", () => {
  beforeEach(() => {
    args = ["node_path", "abapmerge"];
    stderr = captureStream(process.stderr);
  });

  it("entrypoint file name error", () => {
    Logic.run(args);
    expect(stderr.captured()).equal("Specify entrypoint file name")
  });
});