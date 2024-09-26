import { NodeTrustGraphBuilder } from "../NodeTrustGraphBuilder";
import { Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";

describe("NodeTrustGraphBuilder", () => {
  it("should build a TrustGraph with the correct vertices and edges", () => {
    const node1 = new Node("A");
    node1.quorumSet = new QuorumSet(1, ["B"]);
    const node2 = new Node("B");
    node2.quorumSet = new QuorumSet(1, ["A"]);
    const nodes: Node[] = [node1, node2];

    const graph = NodeTrustGraphBuilder.build(nodes);

    expect(graph.vertices.size).toBe(2);
    expect(graph.edges.size).toBe(2);

    const vertex1 = graph.getVertex("A");
    const vertex2 = graph.getVertex("B");

    expect(vertex1).toBeDefined();
    expect(vertex2).toBeDefined();
    if (!vertex1 || !vertex2) {
      return;
    }

    expect(graph.getChildren(vertex1!).has(vertex2!)).toBeTruthy();
    expect(graph.getChildren(vertex1!).size).toBe(1);
    expect(graph.getChildren(vertex2!).has(vertex1!)).toBeTruthy();
    expect(graph.getChildren(vertex2!).size).toBe(1);
  });

  it("should handle empty nodes array", () => {
    const nodes: Node[] = [];

    const graph = NodeTrustGraphBuilder.build(nodes);

    expect(graph.vertices.size).toBe(0);
    expect(graph.edges.size).toBe(0);
  });

  it("should update strongly connected components and network transitive quorum set", () => {
    const node1 = new Node("A");
    node1.quorumSet = new QuorumSet(1, ["B"]);
    const node2 = new Node("B");
    node2.quorumSet = new QuorumSet(1, ["A"]);
    const nodes: Node[] = [node1, node2];

    const graph = NodeTrustGraphBuilder.build(nodes);

    expect(graph.stronglyConnectedComponents.length).toBeGreaterThan(0);
    expect(graph.networkTransitiveQuorumSet.size).toBeGreaterThan(0);
  });
});
