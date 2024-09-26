import { OrganizationTrustGraphBuilder } from "../OrganizationTrustGraphBuilder";
import { Organization, Node } from "@stellarbeat/js-stellarbeat-shared";

describe("OrganizationTrustGraphBuilder", () => {
  let organizations: Organization[];
  let allOrganizations: Organization[];
  let allNodes: Node[];

  beforeEach(() => {
    organizations = [
      new Organization("org1", "Organization 1"),
      new Organization("org2", "Organization 2"),
    ];

    allOrganizations = [
      ...organizations,
      new Organization("org3", "Organization 3"),
    ];

    allNodes = [new Node("node1"), new Node("node2"), new Node("node3")];

    organizations[0].validators.push("node1");
    allNodes[0].quorumSet.validators = ["node2"];
    allNodes[0].quorumSet.threshold = 1;
    allNodes[0].organizationId = organizations[0].id;

    organizations[1].validators.push("node2");
    allNodes[1].quorumSet.validators = ["node1"];
    allNodes[1].quorumSet.threshold = 1;
    allNodes[1].organizationId = organizations[1].id;
  });

  it("should build a trust graph with the correct vertices", () => {
    const graph = OrganizationTrustGraphBuilder.build(
      organizations,
      allOrganizations,
      allNodes,
    );

    expect(graph.vertices.size).toBe(2);
    expect(graph.getVertex("org1")).toBeDefined();
    expect(graph.getVertex("org2")).toBeDefined();
  });

  it("should build a trust graph with the correct edges", () => {
    const graph = OrganizationTrustGraphBuilder.build(
      organizations,
      allOrganizations,
      allNodes,
    );

    const org1Vertex = graph.getVertex("org1");
    const org2Vertex = graph.getVertex("org2");

    expect(graph.hasChild(org1Vertex!, org2Vertex!)).toBe(true);
    expect(graph.hasChild(org2Vertex!, org1Vertex!)).toBe(true);
  });

  it("should not include organizations that are not in the provided list", () => {
    const graph = OrganizationTrustGraphBuilder.build(
      organizations,
      allOrganizations,
      allNodes,
    );

    expect(graph.getVertex("org3")).toBeUndefined();
  });
});
