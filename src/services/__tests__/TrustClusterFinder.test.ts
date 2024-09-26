import { TrustClusterFinder } from "../TrustClusterFinder";
import { Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";

describe("TrustClusterFinder", () => {
  it("should add public keys to the trust cluster", () => {
    const nodeA = new Node("A");
    nodeA.quorumSet = new QuorumSet(1, ["B"]);
    const quorumSetMap = new Map<string, QuorumSet>();
    quorumSetMap.set("A", nodeA.quorumSet);

    const result = TrustClusterFinder.find([nodeA], quorumSetMap);
    expect(result).toEqual(new Set(["A", "B"]));
  });

  it("should find trust clusters in a simple quorum set", () => {
    const nodeA = new Node("A");
    nodeA.quorumSet = new QuorumSet(1, ["A", "B"]);
    const quorumSetMap = new Map<string, QuorumSet>();
    quorumSetMap.set("A", nodeA.quorumSet);

    const result = TrustClusterFinder.find([nodeA], quorumSetMap);
    expect(result).toEqual(new Set(["A", "B"]));
  });

  it("should find trust clusters in nested quorum sets", () => {
    const innerQuorumSet = new QuorumSet(1, ["C"]);
    const nodeA = new Node("A");
    nodeA.quorumSet = new QuorumSet(1, ["A", "B"], [innerQuorumSet]);
    const quorumSetMap = new Map<string, QuorumSet>();
    quorumSetMap.set("A", nodeA.quorumSet);

    const result = TrustClusterFinder.find([nodeA], quorumSetMap);
    expect(result).toEqual(new Set(["A", "B", "C"]));
  });

  it("should handle quorum sets with references to other quorum sets", () => {
    const quorumSetA: QuorumSet = new QuorumSet(1, ["B"]);
    const quorumSetB: QuorumSet = new QuorumSet(1, ["C"]);
    const quorumSetC: QuorumSet = new QuorumSet(1, ["A"]);

    const nodeA = new Node("A");
    nodeA.quorumSet = quorumSetA;
    const nodeB = new Node("B");
    nodeB.quorumSet = quorumSetB;
    const nodeC = new Node("C");
    nodeC.quorumSet = quorumSetC;

    const quorumSetMap = new Map<string, QuorumSet>([
      ["A", quorumSetA],
      ["B", quorumSetB],
      ["C", quorumSetC],
    ]);

    const result = TrustClusterFinder.find([nodeA], quorumSetMap);
    expect(result).toEqual(new Set(["A", "B", "C"]));
  });

  it("should handle empty quorum sets", () => {
    const nodeA = new Node("A");
    nodeA.quorumSet = new QuorumSet(1, [], []);
    const quorumSetMap = new Map<string, QuorumSet>();

    const result = TrustClusterFinder.find([nodeA], quorumSetMap);
    expect(result).toEqual(new Set(["A"]));
  });

  it("should handle multiple nodes", () => {
    const nodeA = new Node("A");
    nodeA.quorumSet = new QuorumSet(1, ["C"]);
    const nodeB = new Node("B");
    nodeB.quorumSet = new QuorumSet(1, ["D"]);
    const quorumSetMap = new Map<string, QuorumSet>();
    quorumSetMap.set("A", nodeA.quorumSet);
    quorumSetMap.set("B", nodeB.quorumSet);

    const result = TrustClusterFinder.find([nodeA, nodeB], quorumSetMap);
    expect(result).toEqual(new Set(["A", "B", "C", "D"]));
  });
});
