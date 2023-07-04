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
      reasons.push("History archive not up-to-date");
    }

    if (
      node.versionStr &&
      network.stellarCoreVersion &&
      SemanticVersionComparer.isBehind(
        node.versionStr,
        network.stellarCoreVersion
      )
    ) {
      reasons.push("Stellar-core version behind");
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
