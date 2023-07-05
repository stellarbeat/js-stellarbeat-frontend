import { Network, Node } from "@stellarbeat/js-stellarbeat-shared";
import { SemanticVersionComparer } from "@/services/SemanticVersionComparer";

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

    if (NodeWarningDetector.nodeVersionBehind(node, network)) {
      reasons.push("Stellar-core version behind");
    }

    return reasons;
  }

  static nodeVersionBehind(node: Node, network: Network) {
    return (
      node.versionStr &&
      network.stellarCoreVersion &&
      SemanticVersionComparer.isBehind(
        node.versionStr,
        network.stellarCoreVersion
      )
    );
  }

  static getNodeWarningReasonsConcatenated(
    node: Node,
    network: Network
  ): string {
    return NodeWarningDetector.getNodeWarningReasons(node, network).join(" | ");
  }
}
