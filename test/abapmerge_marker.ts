import {expect} from "chai";
import AbapmergeMarker from "../src/abapmerge_marker";

describe("Abapmerge marker", () => {
  it("Abapmerge marker renders", () => {
    const marker = new AbapmergeMarker().render();
    expect(marker).to.match(/\* abapmerge (?:(\d+\.[.\d]*\d+))/);
    expect(marker).to.match(/^INTERFACE lif_abapmerge_marker\.$/m);
  });
});
