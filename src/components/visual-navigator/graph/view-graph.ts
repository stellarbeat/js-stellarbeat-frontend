import { Network, TrustGraph } from "@stellarbeat/js-stellar-domain";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import ViewEdge from "@/components/visual-navigator/graph/view-edge";

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

  //todo: network is only needed to set failing status, but is a too heavy dependency
  static fromNodes(
    network: Network,
    trustGraph: TrustGraph,
    mergeWithGraph?: ViewGraph,
    selectedKeys: string[] = []
  ) {
    const viewGraph = new ViewGraph();

    Array.from(trustGraph.edges).forEach((edge) => {
      const viewEdge = ViewEdge.fromNodeEdge(edge, trustGraph, network);
      viewGraph.viewEdges.set(viewEdge.key, viewEdge);
      viewGraph.classifyEdge(viewEdge, selectedKeys);
    });

    trustGraph.vertices.forEach((vertex) => {
      const viewVertex = ViewVertex.fromVertex(vertex, trustGraph, network);
      if (mergeWithGraph && mergeWithGraph.viewVertices.has(viewVertex.key)) {
        viewVertex.x = (
          mergeWithGraph.viewVertices.get(viewVertex.key) as ViewVertex
        ).x;
        viewVertex.y = (
          mergeWithGraph.viewVertices.get(viewVertex.key) as ViewVertex
        ).y;
      }

      viewGraph.viewVertices.set(viewVertex.key, viewVertex);
      viewGraph.classifyVertex(viewVertex, selectedKeys);
    });

    trustGraph.stronglyConnectedComponents
      .filter((scc) => scc.size > 1)
      .forEach((scc, i) => {
        viewGraph.stronglyConnectedComponents[i] = Array.from(scc)
          .filter(
            (vertexKey) => !trustGraph.networkTransitiveQuorumSet.has(vertexKey)
          )
          .map(
            (vertexKey) => viewGraph.viewVertices.get(vertexKey) as ViewVertex
          );
      });

    return viewGraph;
  }

  //todo: network is only needed to set failing status, but is a too heavy dependency
  static fromOrganizations(
    network: Network,
    trustGraph: TrustGraph,
    mergeWithGraph?: ViewGraph,
    selectedKeys: string[] = []
  ) {
    const viewGraph = new ViewGraph();

    //let trustGraphBuilder = new TrustGraphBuilder(trustGraph);
    //let organizationTrustGraph = trustGraphBuilder.buildGraphFromOrganizations(trustGraph.nodesTrustGraph);

    Array.from(trustGraph.edges).forEach((edge) => {
      const viewEdge = ViewEdge.fromOrganizationEdge(edge, trustGraph, network);
      viewGraph.viewEdges.set(viewEdge.key, viewEdge);
      viewGraph.classifyEdge(viewEdge, selectedKeys);
    });

    trustGraph.vertices.forEach((vertex) => {
      const viewVertex = ViewVertex.fromOrganization(
        vertex,
        trustGraph,
        network
      );
      if (mergeWithGraph && mergeWithGraph.viewVertices.has(viewVertex.key)) {
        const mergeVertex = mergeWithGraph.viewVertices.get(viewVertex.key);
        if (!mergeVertex) throw Error("Could not merge with graph");
        viewVertex.x = mergeVertex.x;
        viewVertex.y = mergeVertex.y;
      }
      viewGraph.viewVertices.set(vertex.key, viewVertex);
      viewGraph.classifyVertex(viewVertex, selectedKeys);
    });

    trustGraph.stronglyConnectedComponents
      .filter((scc) => scc.size > 1)
      .forEach((scc, i) => {
        viewGraph.stronglyConnectedComponents[i] = Array.from(scc)
          .filter(
            (vertexKey) => !trustGraph.networkTransitiveQuorumSet.has(vertexKey)
          )
          .map(
            (vertexKey) => viewGraph.viewVertices.get(vertexKey) as ViewVertex
          );
      });

    return viewGraph;
  }

  get transitiveQuorumSetCoordinates() {
    const transitiveQuorumSetPoints: [number, number][] = Array.from(
      this.viewVertices.values()
    )
      .filter((vertex) => vertex.isPartOfTransitiveQuorumSet)
      .map((vertex) => [vertex.x, vertex.y]);

    return transitiveQuorumSetPoints;
  }

  get stronglyConnectedComponentCoordinates() {
    const sccPointsArray: [number, number][][] =
      this.stronglyConnectedComponents.map((scc) => {
        return scc.map((vertex) => [vertex.x, vertex.y]);
      });

    //add dummy point because hull needs minimum 3 points
    sccPointsArray
      .filter((sccPoints) => sccPoints.length === 2)
      .forEach((sccPoints) =>
        sccPoints.push([sccPoints[0][0], sccPoints[0][1] + 0.0001])
      );

    return sccPointsArray;
  }

  classifyVertex(vertex: ViewVertex, selectedVertexKeys: string[]) {
    if (selectedVertexKeys.length > 0) {
      vertex.selected = selectedVertexKeys.includes(vertex.key);
      selectedVertexKeys.forEach((selectedVertexKey) => {
        if (this.viewEdges.has(selectedVertexKey + ":" + vertex.key)) {
          vertex.isTrustedBySelectedVertex = true;
          this.trustedVertices.push(vertex);
        }
        if (this.viewEdges.has(vertex.key + ":" + selectedVertexKey)) {
          vertex.isTrustingSelectedVertex = true;
          this.trustingVertices.push(vertex);
        }
      });
    } else {
      vertex.selected = false;
    }
  }

  classifyEdge(viewEdge: ViewEdge, selectedVertexKeys: string[]) {
    viewEdge.highlightAsTrusted = false;
    viewEdge.highlightAsTrusting = false;
    if (selectedVertexKeys.length > 0) {
      if (selectedVertexKeys.includes(viewEdge.child)) {
        viewEdge.highlightAsTrusting = true;
        this.trustingEdges.push(viewEdge);
      } else if (selectedVertexKeys.includes(viewEdge.parent)) {
        viewEdge.highlightAsTrusted = true;
        this.trustedEdges.push(viewEdge);
      }
    }
    if (viewEdge.isPartOfStronglyConnectedComponent) {
      this.stronglyConnectedEdges.push(viewEdge);
    } else this.regularEdges.push(viewEdge);
  }

  reClassifyVertices(selectedVertexKeys: string[]) {
    this.trustedVertices.forEach(
      (vertex) => (vertex.isTrustedBySelectedVertex = false)
    );
    this.trustingVertices.forEach(
      (vertex) => (vertex.isTrustingSelectedVertex = false)
    );
    this.trustedVertices = [];
    this.trustingVertices = [];
    this.viewVertices.forEach((viewVertex) =>
      this.classifyVertex(viewVertex, selectedVertexKeys)
    );
  }

  reClassifyEdges(selectedVertexKeys: string[]) {
    this.trustedEdges = [];
    this.trustingEdges = [];
    this.regularEdges = [];
    this.stronglyConnectedEdges = [];
    this.viewEdges.forEach((viewEdge) =>
      this.classifyEdge(viewEdge, selectedVertexKeys)
    );
  }
}
