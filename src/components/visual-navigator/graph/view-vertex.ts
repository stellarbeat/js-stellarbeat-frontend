import {
    Network,
    Organization,
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

    static fromVertex(vertex: Vertex, network: Network) {
        let viewVertex = new ViewVertex(vertex.key, vertex.label, network.nodesTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key));
        let node = network.getNodeByPublicKey(vertex.key);
        viewVertex.isFailing = network.isNodeFailing(node);

        return viewVertex;
    }

    static fromOrganization(organization: Organization, organizationTrustGraph: TrustGraph, network: Network) {
        let vertex = organizationTrustGraph.getVertex(organization.id);
        if (!vertex)
            throw new Error('No vertex found for organization: ' + organization.id);

        let viewVertex = new ViewVertex(vertex.key, vertex.label, organizationTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key));
        viewVertex.isFailing = !organization.subQuorumAvailable;

        return viewVertex;
    }
}