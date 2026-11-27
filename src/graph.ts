export default class Graph<T> {
  private nodes: [string, T][];
  private edges: [string, string][];
  private weakEdges: [string, string][];

  public constructor() {
    this.nodes = [];
    this.edges = [];
    this.weakEdges = [];
  }

  public addNode(key: string, value: T) {
    this.nodes.push([key, value]);
  }

  public addEdge(from: string, to: string) {
    this.edges.push([from, to]);
  }

  /** an edge that orders the nodes, but is given up when it is part of a cycle */
  public addWeakEdge(from: string, to: string) {
    this.weakEdges.push([from, to]);
  }

  public removeNode(key: string) {
    this.nodes = this.nodes.filter((n) => n[0] !== key);
    this.edges = this.edges.filter((e) => e[1] !== key);
    this.weakEdges = this.weakEdges.filter((e) => e[1] !== key);
  }

  public toString(): string {
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
    // first choice is a node without any edge, second one without a strong edge
    for (const edges of [this.edges.concat(this.weakEdges), this.edges]) {
      for (const node of this.nodes) {
        if (edges.some((edge) => edge[0] === node[0]) === false) {
          this.removeNode(node[0]);
          return node[1];
        }
      }
    }

    throw Error("No leaf found: " + this);
  }
}
