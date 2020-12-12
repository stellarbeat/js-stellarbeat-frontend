import {
    Network,
    TrustGraph,
    Vertex
} from '@stellarbeat/js-stellar-domain';

export default class ViewVertex {
    key: string;
    label: string;
    x: number = 0;
    y: number = 0;
    isPartOfTransitiveQuorumSet: boolean;
    isTrustingSelectedVertex: boolean = false;
    isTrustedBySelectedVertex: boolean = false;
    selected: boolean = false;
    isFailing: boolean = false;

    constructor(key: string, label: string, isPartOfTransitiveQuorumSet: boolean) {
        this.key = key;
        this.label = label;
        this.isPartOfTransitiveQuorumSet = isPartOfTransitiveQuorumSet;
    }

    static fromVertex(vertex: Vertex, trustGraph: TrustGraph, network: Network) {
        let viewVertex = new ViewVertex(vertex.key, vertex.label, trustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key));
        let node = network.getNodeByPublicKey(vertex.key);
        viewVertex.isFailing = network.isNodeFailing(node);

        return viewVertex;
    }

    static fromOrganization(vertex: Vertex, trustGraph: TrustGraph, network: Network) {
        let viewVertex = new ViewVertex(vertex.key, vertex.label, trustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key));
        let organization = network.getOrganizationById(vertex.key)
        viewVertex.isFailing = !organization.subQuorumAvailable;

        return viewVertex;
    }
}