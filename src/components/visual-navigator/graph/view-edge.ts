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

    protected static fromEdge(edge:Edge, trustGraph: TrustGraph){
        let viewEdge = new ViewEdge(edge.parent.key, edge.child.key);
        viewEdge.isPartOfStronglyConnectedComponent = trustGraph.isEdgePartOfStronglyConnectedComponent(edge);
        viewEdge.isPartOfTransitiveQuorumSet = trustGraph.isEdgePartOfNetworkTransitiveQuorumSet(edge);

        return viewEdge;
    }
    static fromNodeEdge(edge: Edge, trustGraph: TrustGraph, network: Network) {
        let viewEdge = ViewEdge.fromEdge(edge, trustGraph);
       let source = network.getNodeByPublicKey(edge.parent.key)!;
        let target = network.getNodeByPublicKey(edge.child.key)!;
        if (network.isNodeFailing(source) || network.isNodeFailing(target))
            viewEdge.isFailing = true;

        return viewEdge;
    }

    static fromOrganizationEdge(edge: Edge, trustGraph: TrustGraph, network: Network) {
        let viewEdge = ViewEdge.fromEdge(edge, trustGraph);

        let source = network.getOrganizationById(edge.parent.key)!;
        let target = network.getOrganizationById(edge.child.key)!;
        if (!(source.subQuorumAvailable && target.subQuorumAvailable))
            viewEdge.isFailing = true;

        return viewEdge;
    }

}