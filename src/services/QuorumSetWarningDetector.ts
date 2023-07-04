import {
  Network,
  QuorumSet,
  QuorumSetService,
} from "@stellarbeat/js-stellarbeat-shared";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

export class QuorumSetWarningDetector {
  public static getQuorumSetWarnings(quorumSet: QuorumSet, network: Network) {
    if (QuorumSetService.quorumSetHasFailingValidators(quorumSet, network))
      return "Some validators are failing";

    if (QuorumSetWarningDetector.quorumSetHasWarnings(quorumSet, network))
      return "Some validators have warnings";

    return "None";
  }

  //checks one level of inner quorumSets
  public static quorumSetHasWarnings(quorumSet: QuorumSet, network: Network) {
    const hasWarning = (validators: string[]) => {
      return validators
        .map((validator) => network.getNodeByPublicKey(validator))
        .some(
          (validator) =>
            NodeWarningDetector.nodeHasWarning(validator, network) ||
            network.isNodeFailing(validator)
        );
    };
    return (
      hasWarning(quorumSet.validators) ||
      quorumSet.innerQuorumSets.some((quorumSet) =>
        hasWarning(quorumSet.validators)
      )
    );
  }
}
