import {Edge, Network, TrustGraph} from '@stellarbeat/js-stellar-domain';

export default class ViewEdge {
    key: string;
    source: any; //key is replaced by object in d3
    target: any;//key is replaced by object in d3
    parent: string;
    child: string;
    isPartOfStronglyConnectedComponent: boolean = false;
    isPartOfTransitiveQuorumSet: boolean = false;
    highlightAsTrusting: boolean = false;
    highlightAsTrusted: boolean = false;
    isFailing: boolean = false;

    constructor(source: string, target: string) {
        this.source = source;
        this.target = target;
        this.parent = source;
        this.child = target;
        this.key = source + ':' + target;
    }

    static fromNodeEdge(edge: Edge, network: Network) {
        let viewEdge = new ViewEdge(edge.parent.key, edge.child.key);
        let source = network.getNodeByPublicKey(edge.parent.key)!;
        let target = network.getNodeByPublicKey(edge.child.key)!;
        viewEdge.isPartOfStronglyConnectedComponent = network.nodesTrustGraph.isEdgePartOfStronglyConnectedComponent(edge);
        viewEdge.isPartOfTransitiveQuorumSet = network.nodesTrustGraph.isEdgePartOfNetworkTransitiveQuorumSet(edge);
        if (network.isNodeFailing(source) || network.isNodeFailing(target))
            viewEdge.isFailing = true;

        return viewEdge;
    }

    static fromOrganizationEdge(edge: Edge, organizationTrustGraph: TrustGraph, network: Network) {
        let viewEdge = new ViewEdge(edge.parent.key, edge.child.key);
        let source = network.getOrganizationById(edge.parent.key)!;
        let target = network.getOrganizationById(edge.child.key)!;
        viewEdge.isPartOfStronglyConnectedComponent = organizationTrustGraph.isEdgePartOfStronglyConnectedComponent(edge);
        viewEdge.isPartOfTransitiveQuorumSet = organizationTrustGraph.isEdgePartOfNetworkTransitiveQuorumSet(edge);
        if (!(source.subQuorumAvailable && target.subQuorumAvailable))
            viewEdge.isFailing = true;

        return viewEdge;
    }

}