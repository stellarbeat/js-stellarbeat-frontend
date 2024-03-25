import { Network, Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { QuorumSetDangerDetector } from "@/services/QuorumSetDangerDetector";

describe("QuorumSetDangerDetector", () => {
  function setupSUT() {
    const node = new Node("node1");
    const node2 = new Node("node2");
    const quorumSet = new QuorumSet(1, [node.publicKey, node2.publicKey]);
    const network = new Network([node]);
    return { node, node2, quorumSet, network };
  }

  describe("quorumSetHasDangers", () => {
    test("returns true if quorumSet does not reach threshold", () => {
      const { node, quorumSet, network } = setupSUT();
      node.isValidating = false;
      expect(
        QuorumSetDangerDetector.quorumSetHasDangers(node, quorumSet, network),
      ).toEqual(true);
    });
    test("returns false if quorumSet does reach threshold", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.isValidating = true;
      node.activeInScp = true;
      expect(
        QuorumSetDangerDetector.quorumSetHasDangers(node, quorumSet, network),
      ).toEqual(false);
    });

    test("returns true if quorumSet has no validators", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.isValidating = true;
      node.activeInScp = true;
      quorumSet.validators = [];
      expect(
        QuorumSetDangerDetector.quorumSetHasDangers(node, quorumSet, network),
      ).toEqual(true);
    });
  });

  describe("getQuorumSetDangers", () => {
    test("returns 'Quorum set not reaching threshold' if quorumSet does not reach threshold", () => {
      const { node, quorumSet, network } = setupSUT();
      node.isValidating = false;
      expect(
        QuorumSetDangerDetector.getQuorumSetDangers(node, quorumSet, network),
      ).toEqual("Quorum set not reaching threshold");
    });
    test("returns 'None' if quorumSet does reach threshold", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.isValidating = true;
      node.activeInScp = true;
      expect(
        QuorumSetDangerDetector.getQuorumSetDangers(node, quorumSet, network),
      ).toEqual("None");
    });
    test("returns 'Quorum set not yet detected' if quorumSet has no validators", () => {
      const { node, quorumSet, network } = setupSUT();
      node.active = true;
      node.isValidating = true;
      node.activeInScp = true;
      quorumSet.validators = [];
      expect(
        QuorumSetDangerDetector.getQuorumSetDangers(node, quorumSet, network),
      ).toEqual("Quorum set not yet detected");
    });
  });
});
