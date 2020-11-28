import {
    Edge,
    Network,
    Node,
    Organization,
    PublicKey,
    TrustGraph,
    TrustGraphBuilder, Vertex
} from '@stellarbeat/js-stellar-domain';

export class ViewGraph {
    public viewVertices: Map<string, ViewVertex> = new Map<string, ViewVertex>();
    public viewEdges: Map<string, ViewEdge> = new Map<string, ViewEdge>();
    public stronglyConnectedComponents: ViewVertex[][] = [];

    public trustingEdges: ViewEdge[] = [];
    public trustedEdges: ViewEdge[] = [];
    public regularEdges: ViewEdge[] = [];
    public stronglyConnectedEdges: ViewEdge[] = [];

    public trustingVertices: ViewVertex[] = [];
    public trustedVertices: ViewVertex[] = [];

    reset() {
        this.viewVertices = new Map<string, ViewVertex>();
        this.viewEdges = new Map<string, ViewEdge>();
        this.stronglyConnectedComponents = [];
        this.trustedEdges = [];
        this.trustingEdges = [];
        this.regularEdges = [];
        this.stronglyConnectedEdges = [];
    }

    static fromNodes(network: Network, mergeWithGraph?: ViewGraph, selectedKey?: string) {
        let viewGraph = new ViewGraph();

        Array.from(network.nodesTrustGraph.edges).forEach(edge => {
            let viewEdge = ViewEdge.fromNodeEdge(edge, network);
            viewGraph.viewEdges.set(viewEdge.key, viewEdge);
            viewGraph.classifyEdge(viewEdge, selectedKey);
        });

        network.nodesTrustGraph.vertices.forEach(vertex => {
            let viewVertex = ViewVertex.fromVertex(vertex, network);
            if(mergeWithGraph && mergeWithGraph.viewVertices.has(viewVertex.key)){
                viewVertex.x = mergeWithGraph.viewVertices.get(viewVertex.key)!.x;
                viewVertex.y = mergeWithGraph.viewVertices.get(viewVertex.key)!.y;
            }

            viewGraph.viewVertices.set(viewVertex.key, viewVertex);
            viewGraph.classifyVertex(viewVertex, selectedKey);
        });


        network.nodesTrustGraph.stronglyConnectedComponents.forEach((scc, i) => {
            viewGraph.stronglyConnectedComponents[i] = Array.from(scc).map(node => viewGraph.viewVertices.get(node)!);
        })

        return viewGraph;
    }

    static fromOrganizations(network: Network, mergeWithGraph?: ViewGraph, selectedKey?:string) {
        let viewGraph = new ViewGraph();

        let trustGraphBuilder = new TrustGraphBuilder(network);
        let organizationTrustGraph = trustGraphBuilder.buildGraphFromOrganizations(network.nodesTrustGraph);

        Array.from(organizationTrustGraph.edges).forEach(edge => {
            let viewEdge = ViewEdge.fromOrganizationEdge(edge, organizationTrustGraph, network);
            viewGraph.viewEdges.set(viewEdge.key, viewEdge);
            viewGraph.classifyEdge(viewEdge, selectedKey);
        });

        network.organizations.forEach(organization => {
            let vertex = ViewVertex.fromOrganization(organization, organizationTrustGraph, network);
            if(mergeWithGraph && mergeWithGraph.viewVertices.has(vertex.key)){
                vertex.x = mergeWithGraph.viewVertices.get(vertex.key)!.x;
                vertex.y = mergeWithGraph.viewVertices.get(vertex.key)!.y;
            }
            viewGraph.viewVertices.set(vertex.key, vertex);
            viewGraph.classifyVertex(vertex, selectedKey);
        });

        organizationTrustGraph.stronglyConnectedComponents.forEach((scc, i) => {
            viewGraph.stronglyConnectedComponents[i] = Array.from(scc).map(node => viewGraph.viewVertices.get(node)!);
        })

        return viewGraph;
    }

    get transitiveQuorumSetCoordinates() {
        let transitiveQuorumSetPoints: [number, number][] = Array.from(this.viewVertices.values())
            .filter(vertex => vertex.isPartOfTransitiveQuorumSet)
            .map(vertex => [vertex.x, vertex.y]);

        return transitiveQuorumSetPoints;
    }

    get stronglyConnectedComponentCoordinates() {
        let sccPointsArray: [number, number][][] = this.stronglyConnectedComponents.map(scc => {
            return scc.map(vertex => [vertex.x, vertex.y]);
        });

        //add dummy point because hull needs minimum 3 points
        sccPointsArray.filter(sccPoints => sccPoints.length === 2).forEach(sccPoints => sccPoints.push([sccPoints[0][0], sccPoints[0][1] + 0.0001]));

        return sccPointsArray;
    }

    classifyVertex(vertex: ViewVertex, selectedVertexKey?: string) {
        if(selectedVertexKey){
            vertex.selected = vertex.key === selectedVertexKey;
            if(this.viewEdges.has(selectedVertexKey + ':' + vertex.key) && !this.viewEdges.get(selectedVertexKey + ':' + vertex.key)!.isFailing){
                vertex.highlightAsTrusting = true;
                this.trustingVertices.push(vertex);
            }
            else if(this.viewEdges.has(vertex.key + ':' + selectedVertexKey) && !this.viewEdges.get(vertex.key + ':' + selectedVertexKey)!.isFailing) {
                vertex.highlightAsTrusted = true;
                this.trustedVertices.push(vertex);
            }
        }
    }

    classifyEdge(viewEdge: ViewEdge, selectedVertexKey?: string){
            if(selectedVertexKey && viewEdge.child === selectedVertexKey)
                this.trustingEdges.push(viewEdge);
            else if (selectedVertexKey && viewEdge.parent === selectedVertexKey)
                this.trustedEdges.push(viewEdge);
            else if (viewEdge.isPartOfStronglyConnectedComponent)
                this.stronglyConnectedEdges.push(viewEdge);
            else this.regularEdges.push(viewEdge);
    }

    reClassifyVertices(selectedVertexKey?: string){
        this.trustedVertices.forEach(vertex => vertex.highlightAsTrusted = false);
        this.trustingVertices.forEach(vertex => vertex.highlightAsTrusting = false);
        this.trustedVertices = [];
        this.trustingVertices = [];
        this.viewVertices.forEach(viewVertex => this.classifyVertex(viewVertex, selectedVertexKey));
    }

    reClassifyEdges(selectedVertexKey?: string){
        this.trustedEdges = [];
        this.trustingEdges = [];
        this.regularEdges = [];
        this.stronglyConnectedEdges = [];
        this.viewEdges.forEach(viewEdge => this.classifyEdge(viewEdge, selectedVertexKey))
    }
}

export class ViewVertex {
    key: string;
    label: string;
    x: number = 0;
    y: number = 0;
    isPartOfTransitiveQuorumSet: boolean;
    highlightAsTrusting: boolean = false;
    highlightAsTrusted: boolean = false;
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

export class ViewEdge {
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

    constructor(source: PublicKey, target: PublicKey) {
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