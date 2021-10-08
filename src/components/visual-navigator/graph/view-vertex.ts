import { Network, TrustGraph, Vertex } from "@stellarbeat/js-stellar-domain";

export default class ViewVertex {
  key: string;
  label: string;
  x = 0;
  y = 0;
  isPartOfTransitiveQuorumSet: boolean;
  isTrustingSelectedVertex = false;
  isTrustedBySelectedVertex = false;
  selected = false;
  isFailing = false;

  constructor(
    key: string,
    label: string,
    isPartOfTransitiveQuorumSet: boolean
  ) {
    this.key = key;
    this.label = label;
    this.isPartOfTransitiveQuorumSet = isPartOfTransitiveQuorumSet;
  }

  static fromVertex(vertex: Vertex, trustGraph: TrustGraph, network: Network) {
    const viewVertex = new ViewVertex(
      vertex.key,
      vertex.label,
      trustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key)
    );
    const node = network.getNodeByPublicKey(vertex.key);
    viewVertex.isFailing = network.isNodeFailing(node);

    return viewVertex;
  }

  static fromOrganization(
    vertex: Vertex,
    trustGraph: TrustGraph,
    network: Network
  ) {
    const viewVertex = new ViewVertex(
      vertex.key,
      vertex.label,
      trustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key)
    );
    const organization = network.getOrganizationById(vertex.key);
    viewVertex.isFailing = !organization.subQuorumAvailable;

    return viewVertex;
  }
}
