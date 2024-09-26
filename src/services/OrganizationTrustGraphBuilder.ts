import {
  Edge,
  isVertex,
  Node,
  Organization,
  QuorumSet,
  TrustGraph,
  Vertex,
} from "@stellarbeat/js-stellarbeat-shared";
import { NetworkTransitiveQuorumSetFinder } from "@stellarbeat/js-stellarbeat-shared/lib/trust-graph/network-transitive-quorum-set-finder";
import { StronglyConnectedComponentsFinder } from "@stellarbeat/js-stellarbeat-shared/lib/trust-graph/strongly-connected-components-finder";

export class OrganizationTrustGraphBuilder {
  static build(
    organizations: Organization[],
    allOrganizations: Organization[],
    allNodes: Node[],
  ) {
    const organizationsMap = new Map<string, Organization>();
    allOrganizations.forEach((organization) => {
      organizationsMap.set(organization.id, organization);
    });

    const validatorsMap = new Map<string, Node>();
    allNodes.forEach((validator) => {
      validatorsMap.set(validator.publicKey, validator);
    });

    const graph = new TrustGraph(
      new StronglyConnectedComponentsFinder(),
      new NetworkTransitiveQuorumSetFinder(),
    );

    //add vertices
    organizations.forEach((organization) => {
      graph.addVertex(
        new Vertex(
          organization.id,
          organization.name,
          1, //todo: index
        ),
      );
    });

    //add edges
    graph.vertices.forEach((organizationVertex) => {
      const organization = organizationsMap.get(organizationVertex.key);
      if (!organization) return;

      organization.validators.forEach((publicKey) => {
        const validator = validatorsMap.get(publicKey);
        if (!validator) return;

        QuorumSet.getAllValidators(validator.quorumSet)
          .map((trustedValidator) => validatorsMap.get(trustedValidator))
          .map((trustedValidator) => trustedValidator?.organizationId)
          .filter((organizationId) => organizationId !== undefined)
          .map((organizationId) => organizationsMap.get(organizationId!))
          .filter((trustedOrganization) => trustedOrganization !== undefined)
          .forEach((trustedOrganization) => {
            const trustedOrganizationVertex = graph.getVertex(
              trustedOrganization!.id,
            );
            if (!isVertex(trustedOrganizationVertex)) return;
            if (!graph.hasChild(organizationVertex, trustedOrganizationVertex))
              graph.addEdge(
                new Edge(organizationVertex, trustedOrganizationVertex!),
              );
          });
      });
    });

    graph.updateStronglyConnectedComponentsAndNetworkTransitiveQuorumSet();

    return graph;
  }
}
