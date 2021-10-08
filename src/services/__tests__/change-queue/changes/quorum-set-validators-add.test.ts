import { Node, QuorumSet } from "@stellarbeat/js-stellar-domain";
import { EntityPropertyUpdate } from "../../../change-queue/changes/entity-property-update";
import { QuorumSetValidatorsAdd } from "@/services/change-queue/changes/quorum-set-validators-add";

describe("quorum set add validators", () => {
  test("QuorumSet add validators", () => {
    const quorumSet = new QuorumSet();
    quorumSet.validators = ["a"];
    const command = new QuorumSetValidatorsAdd(quorumSet, ["b", "c"]);
    command.execute();
    expect(quorumSet.validators).toEqual(["a", "b", "c"]);
    command.revert();
    expect(quorumSet.validators).toEqual(["a"]);
  });
});
