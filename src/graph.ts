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
    for (let node of this.nodes) {
      if (node[0] === key) {
        const index = this.nodes.indexOf(node);
        this.nodes.splice(index, 1);
      }
    }

    for (let edge of this.edges) {
      if (edge[1] === key) {
        const index = this.edges.indexOf(edge);
        this.edges.splice(index, 1);
      }
    }
  }

  public countNodes() {
    return this.nodes.length;
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

    throw "No leaf found";
  }
}
