import {
  Edge,
  Node,
  QuorumSet,
  TrustGraph,
  Vertex,
} from "@stellarbeat/js-stellarbeat-shared";
import { NetworkTransitiveQuorumSetFinder } from "@stellarbeat/js-stellarbeat-shared/lib/trust-graph/network-transitive-quorum-set-finder";
import { StronglyConnectedComponentsFinder } from "@stellarbeat/js-stellarbeat-shared/lib/trust-graph/strongly-connected-components-finder";

export class NodeTrustGraphBuilder {
  // Make sure to provide ALL the nodes, including the ones trusted through quorumsets.
  static build(nodes: Node[]): TrustGraph {
    const graph = new TrustGraph(
      new StronglyConnectedComponentsFinder(),
      new NetworkTransitiveQuorumSetFinder(),
    );

    const nodesMap = new Map<string, Node>();
    nodes.forEach((node) => {
      nodesMap.set(node.publicKey, node);
    });

    nodes //first we create the vertices
      .forEach((node) => {
        graph.addVertex(
          new Vertex(node.publicKey, node.displayName, node.index),
        );
      });

    graph.vertices.forEach((vertex) => {
      //now we add the edges, the trust connections
      const node = nodesMap.get(vertex.key);
      if (!node) return;

      NodeTrustGraphBuilder.addNodeEdges(vertex, node.quorumSet, graph);
    });

    graph.updateStronglyConnectedComponentsAndNetworkTransitiveQuorumSet();
    return graph;
  }

  private static addNodeEdges(
    parent: Vertex,
    quorumSet: QuorumSet,
    graph: TrustGraph,
  ) {
    const validators = QuorumSet.getAllValidators(quorumSet);
    validators.forEach((validator) => {
      const vertex = graph.getVertex(validator);
      if (vertex) graph.addEdge(new Edge(parent, vertex));
    });
  }
}
