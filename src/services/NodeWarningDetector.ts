import { Network, Node } from "@stellarbeat/js-stellarbeat-shared";

export class NodeWarningDetector {
  static nodeHasWarning(node: Node, network: Network) {
    return NodeWarningDetector.getNodeWarningReasons(node, network).length > 0;
  }

  static getNodeWarningReasons(node: Node, network: Network) {
    const reasons: string[] = [];
    if (network.historyArchiveHasError(node)) {
      reasons.push("History archive issue detected");
    }

    if (network.isFullValidatorWithOutOfDateArchive(node)) {
      reasons.push("History archive behind");
    }

    if (node.stellarCoreVersionBehind) {
      reasons.push("Stellar-core version behind");
    }

    if (node.connectivityError) {
      reasons.push("Could not connect to node");
    }

    return reasons;
  }

  static getNodeWarningReasonsConcatenated(
    node: Node,
    network: Network
  ): string {
    return NodeWarningDetector.getNodeWarningReasons(node, network).join(" | ");
  }
}
