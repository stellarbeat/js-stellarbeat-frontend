import { Network, Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";

export class QuorumSetDangerDetector {
  public static quorumSetHasDangers(
    node: Node,
    quorumSet: QuorumSet,
    network: Network,
  ) {
    if (!quorumSet.hasValidators()) return true;

    return network.isQuorumSetBlocked(node, quorumSet);
  }

  public static getQuorumSetDangers(
    node: Node,
    quorumSet: QuorumSet,
    network: Network,
  ) {
    if (!quorumSet.hasValidators()) return "Quorum set not yet detected";

    if (network.isQuorumSetBlocked(node, quorumSet))
      return "Quorum set not reaching threshold";

    return "None";
  }
}
