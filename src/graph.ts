export default class Graph<T> {
  private nodes: [String, T][];
  private edges: [String, String][];

  public constructor() {
    this.nodes = [];
    this.edges = [];
  }

  public addNode(key: String, value: T) {
    this.nodes.push([key, value]);
  }

  public addEdge(from: String, to: String) {
    this.edges.push([from, to]);
  }

  public removeNode(key: String) {
    this.nodes = this.nodes.filter((n) => n[0] !== key);
    this.edges = this.edges.filter((e) => e[1] !== key);
  }

  public toString(): String {
    const nodes = this.nodes.map(n => n[0]).join(", ");
    const edges = this.edges.map(e => e[0] + "->" + e[1]).join(", ");
    return nodes + "\n" + edges;
  }

  public countNodes(): number {
    return this.nodes.length;
  }

  public countEdges(): number {
    return this.edges.length;
  }

  public popLeaf(): T {
    for (let node of this.nodes) {
      let leaf = true;
      for (let edge of this.edges) {
        if (edge[0] === node[0]) {
          leaf = false;
          break;
        }
      }

      if (leaf === true) {
        this.removeNode(node[0]);
        return node[1];
      }
    }

    throw Error("No leaf found: " + this);
  }
}
