import { Network, Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { QuorumSetWarningDetector } from "@/services/QuorumSetWarningDetector";

describe("QuorumSetWarningDetector", () => {
  function setupSUT() {
    const node = new Node("node1");
    const quorumSet = new QuorumSet(1, [node.publicKey]);
    const network = new Network([node]);
    return { node, quorumSet, network };
  }

  describe("getQuorumSetWarnings", () => {
    test("returns 'Some validators are failing' if quorumSet has failing validators", () => {
      const { node, quorumSet, network } = setupSUT();
      node.isValidating = false;
      expect(
        QuorumSetWarningDetector.getQuorumSetWarnings(quorumSet, network)
      ).toEqual("Some validators are failing");
    });

    test("returns 'Some validators have warnings' if quorumSet has validators with warnings", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.activeInScp = true;
      node.isValidating = true;
      node.historyArchiveHasError = true;
      node.historyUrl = "http://localhost:11626";

      expect(
        QuorumSetWarningDetector.getQuorumSetWarnings(quorumSet, network)
      ).toEqual("Some validators have warnings");
    });

    test("returns 'None' if quorumSet has no warnings", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.activeInScp = true;
      node.isValidating = true;

      expect(
        QuorumSetWarningDetector.getQuorumSetWarnings(quorumSet, network)
      ).toEqual("None");
    });
  });

  describe("quorumSetHasWarnings", () => {
    test("returns true if quorumSet has failing validators", () => {
      const { node, quorumSet, network } = setupSUT();
      node.isValidating = false;
      expect(
        QuorumSetWarningDetector.quorumSetHasWarnings(quorumSet, network)
      ).toEqual(true);
    });

    test("returns true if quorumSet has validators with warnings", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.activeInScp = true;
      node.isValidating = true;
      node.historyArchiveHasError = true;
      node.historyUrl = "http://localhost:11626";

      expect(
        QuorumSetWarningDetector.quorumSetHasWarnings(quorumSet, network)
      ).toEqual(true);
    });

    test("returns false if quorumSet has no warnings", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.activeInScp = true;
      node.isValidating = true;

      expect(
        QuorumSetWarningDetector.quorumSetHasWarnings(quorumSet, network)
      ).toEqual(false);
    });
  });
});
