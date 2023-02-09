import { Edge, Network, TrustGraph } from "@stellarbeat/js-stellarbeat-shared";

export default class ViewEdge {
  key: string;
  source: Record<string, unknown> | string; //key is replaced by object in d3
  target: Record<string, unknown> | string; //key is replaced by object in d3
  parent: string;
  child: string;
  isPartOfStronglyConnectedComponent = false;
  isPartOfTransitiveQuorumSet = false;
  highlightAsTrusting = false;
  highlightAsTrusted = false;
  isFailing = false;
  x?: number;
  y?: number;

  constructor(source: string, target: string) {
    this.source = source;
    this.target = target;
    this.parent = source;
    this.child = target;
    this.key = source + ":" + target;
  }

  protected static fromEdge(edge: Edge, trustGraph: TrustGraph) {
    const viewEdge = new ViewEdge(edge.parent.key, edge.child.key);
    viewEdge.isPartOfStronglyConnectedComponent =
      trustGraph.isEdgePartOfStronglyConnectedComponent(edge);
    viewEdge.isPartOfTransitiveQuorumSet =
      trustGraph.isEdgePartOfNetworkTransitiveQuorumSet(edge);

    return viewEdge;
  }

  static fromNodeEdge(edge: Edge, trustGraph: TrustGraph, network: Network) {
    const viewEdge = ViewEdge.fromEdge(edge, trustGraph);
    const source = network.getNodeByPublicKey(edge.parent.key);
    const target = network.getNodeByPublicKey(edge.child.key);
    if (network.isNodeFailing(source) || network.isNodeFailing(target))
      viewEdge.isFailing = true;

    return viewEdge;
  }

  static fromOrganizationEdge(
    edge: Edge,
    trustGraph: TrustGraph,
    network: Network
  ) {
    const viewEdge = ViewEdge.fromEdge(edge, trustGraph);

    const source = network.getOrganizationById(edge.parent.key);
    const target = network.getOrganizationById(edge.child.key);
    if (!(source.subQuorumAvailable && target.subQuorumAvailable))
      viewEdge.isFailing = true;

    return viewEdge;
  }
}
