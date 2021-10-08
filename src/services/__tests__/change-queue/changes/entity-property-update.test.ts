import { Node, QuorumSet } from "@stellarbeat/js-stellar-domain";
import { EntityPropertyUpdate } from "../../../change-queue/changes/entity-property-update";

describe("entity property update", () => {
  test("Node property", () => {
    const node = new Node("a");
    node.active = false;
    const command = new EntityPropertyUpdate(node, "active", true);
    command.execute();
    expect(node.active).toBeTruthy();
    command.revert();
    expect(node.active).toBeFalsy();
  });

  test("QuorumSet validators", () => {
    const quorumSet = new QuorumSet();
    quorumSet.validators = ["a", "b"];
    const command = new EntityPropertyUpdate(quorumSet, "validators", [
      "a",
      "b",
      "c",
    ]);
    command.execute();
    expect(quorumSet.validators).toEqual(["a", "b", "c"]);
    command.revert();
    expect(quorumSet.validators).toEqual(["a", "b"]);
  });

  test("QuorumSet add innerQuorumSet", () => {
    const quorumSet = new QuorumSet();
    const innerQuorumSet1 = new QuorumSet();
    const newInnerQuorumSet = new QuorumSet();
    quorumSet.innerQuorumSets = [innerQuorumSet1];

    const command = new EntityPropertyUpdate(quorumSet, "innerQuorumSets", [
      innerQuorumSet1,
      newInnerQuorumSet,
    ]);
    command.execute();
    expect(quorumSet.innerQuorumSets).toEqual([
      innerQuorumSet1,
      newInnerQuorumSet,
    ]);
    command.revert();
    expect(quorumSet.innerQuorumSets).toEqual([innerQuorumSet1]);
  });

  test("QuorumSet remove innerQuorumSet", () => {
    const quorumSet = new QuorumSet();
    const innerQuorumSet1 = new QuorumSet();
    const innerQuorumSet2 = new QuorumSet();
    quorumSet.innerQuorumSets = [innerQuorumSet1, innerQuorumSet2];

    const command = new EntityPropertyUpdate(quorumSet, "innerQuorumSets", [
      innerQuorumSet1,
    ]);
    command.execute();
    expect(quorumSet.innerQuorumSets).toEqual([innerQuorumSet1]);
    command.revert();
    expect(quorumSet.innerQuorumSets).toEqual([
      innerQuorumSet1,
      innerQuorumSet2,
    ]);
  });
});
