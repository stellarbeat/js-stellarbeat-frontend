import { Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";

export class TrustClusterFinder {
  static find(
    nodes: Node[],
    allKnownQuorumSets: Map<string, QuorumSet>,
  ): Set<string> {
    const trustCluster = new Set<string>();
    nodes
      .map((node) => node.quorumSet)
      .forEach((quorumSet) => {
        TrustClusterFinder.findInternal(
          quorumSet,
          allKnownQuorumSets,
          trustCluster,
        );
      });

    nodes.map((node) => node.publicKey).forEach((key) => trustCluster.add(key));
    return trustCluster;
  }

  private static findInternal(
    quorumSet: QuorumSet,
    allKnownQuorumSets: Map<string, QuorumSet>,
    processedNodes: Set<string>,
  ) {
    quorumSet.validators.forEach((validator) => {
      if (!processedNodes.has(validator)) {
        processedNodes.add(validator);
        const quorumSet = allKnownQuorumSets.get(validator);
        if (quorumSet) {
          this.findInternal(quorumSet, allKnownQuorumSets, processedNodes);
        }
      }
    });

    quorumSet.innerQuorumSets.forEach((innerQuorumSet) => {
      this.findInternal(innerQuorumSet, allKnownQuorumSets, processedNodes);
    });

    return processedNodes;
  }
}
