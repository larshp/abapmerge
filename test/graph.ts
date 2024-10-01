import * as chai from "chai";
import Graph from "../src/graph";

const expect = chai.expect;

describe("graph 1, test", () => {
  it("something", () => {
    const g = new Graph<string>();

    g.addNode("node1", "value1");
    g.addNode("node2", "value2");

    g.addEdge("node1", "node2");

    expect(g.popLeaf()).to.equal("value2");
    expect(g.popLeaf()).to.equal("value1");
  });
});


describe("graph 2, test", () => {
  it("something", () => {
    const g = new Graph<string>();

    g.addNode("node1", "value1");
    g.addNode("node2", "value2");
    g.addNode("node3", "value3");

    g.addEdge("node1", "node3");
    g.addEdge("node2", "node3");

    expect(g.popLeaf()).to.equal("value3");

    expect(g.countNodes()).to.equal(2);
    expect(g.countEdges()).to.equal(0);
  });
});
