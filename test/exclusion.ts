import {expect} from "chai";
import {Logic} from "../src/cli";

describe("Directory exclusion patterns", () => {
  it("should exclude directories matching simple wildcard patterns", () => {
    expect((Logic as any).shouldExcludeDir("/path/to/test", "test*")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/testing", "test*")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/production", "test*")).to.equal(false);
  });

  it("should exclude directories matching glob patterns with wildcards", () => {
    expect((Logic as any).shouldExcludeDir("/path/to/temp", "*temp*")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/temporary", "*temp*")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/production", "*temp*")).to.equal(false);
  });

  it("should exclude directories matching brace expansion patterns", () => {
    expect((Logic as any).shouldExcludeDir("/path/to/test", "{test*,build*}")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/build", "{test*,build*}")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/builddir", "{test*,build*}")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/production", "{test*,build*}")).to.equal(false);
  });

  it("should handle case sensitive matching", () => {
    expect((Logic as any).shouldExcludeDir("/path/to/test", "test*")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/TEST", "test*")).to.equal(false);
    expect((Logic as any).shouldExcludeDir("/path/to/Test", "test*")).to.equal(false);
    expect((Logic as any).shouldExcludeDir("/path/to/TEST", "TEST*")).to.equal(true);
  });

  it("should not exclude when no pattern is provided", () => {
    expect((Logic as any).shouldExcludeDir("/path/to/test", undefined)).to.equal(false);
    expect((Logic as any).shouldExcludeDir("/path/to/test", "")).to.equal(false);
  });

  it("should handle exact directory name matches", () => {
    expect((Logic as any).shouldExcludeDir("/path/to/node_modules", "node_modules")).to.equal(true);
    expect((Logic as any).shouldExcludeDir("/path/to/node_modules_backup", "node_modules")).to.equal(false);
  });

  it("should only match directory basename not full path", () => {
    expect((Logic as any).shouldExcludeDir("/test/path/to/production", "test*")).to.equal(false);
    expect((Logic as any).shouldExcludeDir("/production/path/to/test", "test*")).to.equal(true);
  });
});
