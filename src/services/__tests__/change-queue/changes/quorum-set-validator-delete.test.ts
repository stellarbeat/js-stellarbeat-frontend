import { QuorumSet } from "@stellarbeat/js-stellar-domain";
import { QuorumSetValidatorDelete } from "@/services/change-queue/changes/quorum-set-validator-delete";

describe("quorum set delete validator", () => {
  test("QuorumSet delete validator", () => {
    const quorumSet = new QuorumSet();
    quorumSet.validators = ["a", "b", "c"];
    const command = new QuorumSetValidatorDelete(quorumSet, "b");
    command.execute();
    expect(quorumSet.validators).toEqual(["a", "c"]);
    command.revert();
    expect(quorumSet.validators).toEqual(["a", "c", "b"]);
  });
});
