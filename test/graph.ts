import * as chai from "chai";
import Graph from "../src/graph";

let expect = chai.expect;

describe("graph 1, test", () => {
  it("something", () => {
    let g = new Graph<String>();

    g.addNode("node1", "value1");
    g.addNode("node2", "value2");

    g.addEdge("node1", "node2");

    expect(g.popLeaf()).to.equal("value2");
    expect(g.popLeaf()).to.equal("value1");
  });
});
