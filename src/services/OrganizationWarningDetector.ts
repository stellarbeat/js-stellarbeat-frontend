import { Network, Organization } from "@stellarbeat/js-stellarbeat-shared";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

export class OrganizationWarningDetector {
  public static organizationHasWarnings(
    organization: Organization,
    network: Network
  ) {
    return (
      OrganizationWarningDetector.getOrganizationWarningReasons(
        organization,
        network
      ).length > 0
    );
  }

  public static organizationHasValidatorsWithStellarCoreRunningBehind(
    organization: Organization,
    network: Network
  ) {
    return organization.validators
      .map((validator) => network.getNodeByPublicKey(validator))
      .some((validator) =>
        NodeWarningDetector.nodeVersionBehind(validator, network)
      );
  }

  public static organizationHasValidatorsThatWeCouldNotConnectTo(
    organization: Organization,
    network: Network
  ) {
    return organization.validators
      .map((validator) => network.getNodeByPublicKey(validator))
      .some((validator) => validator.connectivityError);
  }

  public static organizationHasOutOfDateHistoryArchives(
    organization: Organization,
    network: Network
  ) {
    return organization.validators
      .map((validator) => network.getNodeByPublicKey(validator))
      .some((validator) =>
        network.isFullValidatorWithOutOfDateArchive(validator)
      );
  }

  public static organizationHasHistoryArchivesWithError(
    organization: Organization,
    network: Network
  ) {
    return organization.validators
      .map((validator) => network.getNodeByPublicKey(validator))
      .some((validator) => network.historyArchiveHasError(validator));
  }

  public static getOrganizationWarningReasons(
    organization: Organization,
    network: Network
  ) {
    const reasons: string[] = [];
    if (
      OrganizationWarningDetector.getOrganizationFailAt(
        organization,
        network
      ) === 1
    )
      reasons.push("If one more validator fails, this organization will fail");

    if (
      OrganizationWarningDetector.organizationHasHistoryArchivesWithError(
        organization,
        network
      )
    ) {
      reasons.push("History archive verification issue");
    }

    if (
      OrganizationWarningDetector.organizationHasOutOfDateHistoryArchives(
        organization,
        network
      )
    )
      reasons.push("History archive behind");

    if (
      OrganizationWarningDetector.organizationHasValidatorsWithStellarCoreRunningBehind(
        organization,
        network
      )
    )
      reasons.push("Stellar-core version behind");

    if (
      OrganizationWarningDetector.organizationHasValidatorsThatWeCouldNotConnectTo(
        organization,
        network
      )
    )
      reasons.push("Could not connect to all validators");

    if (!["Ok", "Unknown"].includes(organization.tomlState))
      reasons.push(
        "Stellar.toml issue: " +
          organization.tomlState
            .split(/(?=[A-Z])/)
            .join(" ")
            .toLowerCase()
      );

    return reasons;
  }

  public static someOrganizationsHaveWarnings(
    organizations: Organization[],
    network: Network
  ) {
    return organizations.some(
      (organization) =>
        this.organizationHasWarnings(organization, network) ||
        network.isOrganizationFailing(organization) //todo: actually a danger?
    );
  }

  public static getOrganizationFailAt(
    organization: Organization,
    network: Network
  ) {
    const nrOfValidatingNodes = organization.validators
      .map((validator) => network.getNodeByPublicKey(validator))
      .filter((node) => !network.isNodeFailing(node)).length;

    return nrOfValidatingNodes - organization.subQuorumThreshold + 1;
  }
}
