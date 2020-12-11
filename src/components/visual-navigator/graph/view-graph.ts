import {
    Network,
    TrustGraphBuilder
} from '@stellarbeat/js-stellar-domain';
import ViewVertex from '@/components/visual-navigator/graph/view-vertex';
import ViewEdge from '@/components/visual-navigator/graph/view-edge';

export default class ViewGraph {
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
        } else {
            vertex.selected = false;
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