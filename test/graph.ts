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

describe("graph 3, weak edges", () => {
  it("order like strong edges", () => {
    const g = new Graph<string>();

    g.addNode("node1", "value1");
    g.addNode("node2", "value2");

    g.addWeakEdge("node1", "node2");

    expect(g.popLeaf()).to.equal("value2");
    expect(g.popLeaf()).to.equal("value1");
  });

  it("are given up in a cycle", () => {
    const g = new Graph<string>();

    g.addNode("node1", "value1");
    g.addNode("node2", "value2");
    g.addNode("node3", "value3");

    g.addWeakEdge("node1", "node2");
    g.addWeakEdge("node2", "node1");
    g.addEdge("node1", "node3");

    expect(g.popLeaf()).to.equal("value3");
    expect(g.popLeaf()).to.equal("value1");
    expect(g.popLeaf()).to.equal("value2");
  });

  it("a cycle of strong edges still fails", () => {
    const g = new Graph<string>();

    g.addNode("node1", "value1");
    g.addNode("node2", "value2");

    g.addEdge("node1", "node2");
    g.addEdge("node2", "node1");

    expect(() => g.popLeaf()).to.throw("No leaf found");
  });
});
