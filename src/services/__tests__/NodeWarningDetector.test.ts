import { Network, Node } from "@stellarbeat/js-stellarbeat-shared";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

describe("NodeWarningDetector", () => {
  describe("nodeHasWarning", () => {
    it("returns true if the node version is behind the latest stellar core version", () => {
      const node = new Node("a");
      node.versionStr = "10.0.0";
      const network = new Network();
      network.stellarCoreVersion = "11.0.0";
      expect(NodeWarningDetector.nodeHasWarning(node, network)).toBe(true);
    });

    it("returns true if node is a full validator with out of date archive", () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = false;
      const network = new Network([node]);
      expect(NodeWarningDetector.nodeHasWarning(node, network)).toBe(true);
    });

    it("returns true if node has history archive error", () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.historyArchiveHasError = true;
      const network = new Network([node]);
      expect(NodeWarningDetector.nodeHasWarning(node, network)).toBe(true);
    });

    it("returns false if node has no warnings", () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = true;
      node.historyArchiveHasError = false;
      node.versionStr = "11.0.0";
      const network = new Network([node]);
      network.stellarCoreVersion = "10.0.0";
      expect(NodeWarningDetector.nodeHasWarning(node, network)).toBe(false);
    });
  });

  describe("getNodeWarningReasons", () => {
    it('returns "History archive not up-to-date" if node is a full validator with out of date archive', () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = false;
      const network = new Network([node]);
      expect(NodeWarningDetector.getNodeWarningReasons(node, network)).toEqual([
        "History archive not up-to-date",
      ]);
    });
    it('returns "History archive issue detected" if node has history archive error', () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = true;
      node.historyArchiveHasError = true;
      const network = new Network([node]);
      expect(NodeWarningDetector.getNodeWarningReasons(node, network)).toEqual([
        "History archive issue detected",
      ]);
    });
    it("returns empty array if node has no warnings", () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = true;
      node.historyArchiveHasError = false;
      const network = new Network([node]);
      expect(NodeWarningDetector.getNodeWarningReasons(node, network)).toEqual(
        []
      );
    });
    it('returns "Stellar-core version behind" if node version is behind the latest stellar core version', () => {
      const node = new Node("a");
      node.versionStr = "10.0.0";
      const network = new Network();
      network.stellarCoreVersion = "11.0.0";
      expect(NodeWarningDetector.getNodeWarningReasons(node, network)).toEqual([
        "Stellar-core version behind",
      ]);
    });
  });

  describe("getPrimaryNodeWarningReason", () => {
    it("returns empty string if node has no warnings", () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = true;
      node.historyArchiveHasError = false;
      const network = new Network([node]);
      expect(
        NodeWarningDetector.getPrimaryNodeWarningReason(node, network)
      ).toEqual("");
    });

    it('returns "History archive issue detected" if node is a full validator with out of date archive and has other warnings', () => {
      const node = new Node("a");
      node.historyUrl = "http://localhost:11626";
      node.isFullValidator = false;
      node.historyArchiveHasError = true;
      node.versionStr = "10.0.0";
      const network = new Network([node]);
      network.stellarCoreVersion = "11.0.0";
      expect(
        NodeWarningDetector.getPrimaryNodeWarningReason(node, network)
      ).toEqual("History archive issue detected");
    });
  });
});
