import {
  Network,
  Node,
  Organization,
} from "@stellarbeat/js-stellarbeat-shared";
import { OrganizationWarningDetector } from "@/services/OrganizationWarningDetector";

describe("OrganizationWarningDetector", () => {
  function setupSUT() {
    const organization = new Organization("org", "org");
    organization.subQuorumAvailable = true;
    const validator1 = new Node("a");
    validator1.versionStr = "1.0.0";
    validator1.historyUrl = "http://localhost:11626";
    validator1.isFullValidator = true;
    validator1.historyArchiveHasError = false;
    validator1.active = true;
    validator1.isValidating = true;
    validator1.activeInScp = true;

    const validator2 = new Node("b");
    validator2.versionStr = "1.0.0";
    validator2.historyUrl = "http://localhost:11626";
    validator2.isFullValidator = true;
    validator2.historyArchiveHasError = false;
    validator2.active = true;
    validator2.isValidating = true;
    validator2.activeInScp = true;

    organization.validators.push(validator1.publicKey, validator2.publicKey);
    const network = new Network([validator1, validator2], [organization]);
    network.stellarCoreVersion = "1.0.0";

    return {
      organization,
      validator1,
      validator2,
      network,
    };
  }

  describe("organizationHasValidatorsWithStellarCoreRunningBehind", () => {
    test("returns true if any validator is behind", () => {
      const { organization, validator1, network } = setupSUT();
      validator1.stellarCoreVersionBehind = true;
      expect(
        OrganizationWarningDetector.organizationHasValidatorsWithStellarCoreRunningBehind(
          organization,
          network,
        ),
      ).toBeTruthy();
      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeTruthy();
      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual(["Stellar-core version behind"]);
    });

    test("returns false if no validator is behind", () => {
      const { organization, network } = setupSUT();
      expect(
        OrganizationWarningDetector.organizationHasValidatorsWithStellarCoreRunningBehind(
          organization,
          network,
        ),
      ).toBeFalsy();

      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeFalsy();
      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual([]);
    });
  });

  describe("organizationHasOutOfDateHistoryArchives", () => {
    test("returns true if any validator has out of date archive", () => {
      const { organization, validator1, network } = setupSUT();
      validator1.isFullValidator = false;
      expect(
        OrganizationWarningDetector.organizationHasOutOfDateHistoryArchives(
          organization,
          network,
        ),
      ).toBeTruthy();

      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeTruthy();
      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual(["History archive behind"]);
    });
    test("returns false if no validator has out of date archive", () => {
      const { organization, network } = setupSUT();
      expect(
        OrganizationWarningDetector.organizationHasOutOfDateHistoryArchives(
          organization,
          network,
        ),
      ).toBeFalsy();

      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeFalsy();
      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual([]);
    });
  });

  describe("organizationHasHistoryArchivesWithError", () => {
    test("returns true if any validator has history archive error", () => {
      const { organization, validator1, network } = setupSUT();
      validator1.historyArchiveHasError = true;
      expect(
        OrganizationWarningDetector.organizationHasHistoryArchivesWithError(
          organization,
          network,
        ),
      ).toBeTruthy();

      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeTruthy();

      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual(["History archive verification issue"]);
    });
    test("returns false if no validator has history archive error", () => {
      const { organization, network } = setupSUT();
      expect(
        OrganizationWarningDetector.organizationHasHistoryArchivesWithError(
          organization,
          network,
        ),
      ).toBeFalsy();

      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeFalsy();

      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual([]);
    });
  });
  describe("Stellar.toml issue", () => {
    test("returns true if Stellar.toml issue", () => {
      const { organization, network } = setupSUT();
      organization.tomlState = "UnsupportedVersion";
      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeTruthy();

      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual(["Stellar.toml issue: unsupported version"]);
    });
    test("returns false if no Stellar.toml issue", () => {
      const { organization, network } = setupSUT();
      organization.tomlState = "Ok";
      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeFalsy();

      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual([]);
    });
  });

  describe("organization wil almost fail", () => {
    test("returns true if one more failing validator fails the organization", () => {
      const { organization, validator1, validator2, network } = setupSUT();
      validator1.active = false;
      validator1.isValidating = false;
      validator1.activeInScp = false;

      validator2.active = true;
      validator2.isValidating = true;
      validator2.activeInScp = true;

      expect(
        OrganizationWarningDetector.organizationHasWarnings(
          organization,
          network,
        ),
      ).toBeTruthy();
      expect(
        OrganizationWarningDetector.getOrganizationWarningReasons(
          organization,
          network,
        ),
      ).toEqual(["If one more validator fails, this organization will fail"]);
    });
  });

  describe("someOrganizationsHaveWarnings", () => {
    function setupSUTInner() {
      const { validator1, validator2 } = setupSUT();
      const organization1 = new Organization("a", "a");
      organization1.subQuorumAvailable = true;
      organization1.validators.push(validator1.publicKey);
      organization1.validators.push(validator2.publicKey);

      const organization2 = new Organization("b", "b");
      organization2.subQuorumAvailable = true;
      organization2.validators.push(validator1.publicKey);
      organization2.validators.push(validator2.publicKey);

      const validator3 = new Node("c");
      validator3.active = true;
      validator3.isValidating = true;
      validator3.activeInScp = true;
      validator3.isFullValidator = true;
      validator3.historyArchiveHasError = false;
      validator3.versionStr = "1.0.0";

      organization2.validators.push(validator3.publicKey);

      const network = new Network(
        [validator1, validator2, validator3],
        [organization1, organization2],
      );
      network.stellarCoreVersion = "1.0.0";
      return { validator1, validator2, organization1, organization2, network };
    }

    test("returns true if any organization has warnings", () => {
      const { validator1, organization1, organization2, network } =
        setupSUTInner();
      validator1.historyArchiveHasError = true;

      expect(
        OrganizationWarningDetector.someOrganizationsHaveWarnings(
          [organization1, organization2],
          network,
        ),
      ).toBeTruthy();
    });

    test("returns false if no organization has warnings", () => {
      const { organization1, organization2, network } = setupSUTInner();

      expect(
        OrganizationWarningDetector.someOrganizationsHaveWarnings(
          [organization1, organization2],
          network,
        ),
      ).toBeFalsy();
    });
  });
});
