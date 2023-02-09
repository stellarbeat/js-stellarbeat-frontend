import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { InnerQuorumSetDelete } from "@/services/change-queue/changes/inner-quorum-set-delete";

describe("quorum set delete inner quorum set", () => {
  test("quorumSet delete inner quorumSet", () => {
    const quorumSet = new QuorumSet();
    const innerQSet1 = new QuorumSet();
    const innerQSet2 = new QuorumSet();

    quorumSet.innerQuorumSets.push(innerQSet1, innerQSet2);

    const command = new InnerQuorumSetDelete(quorumSet, innerQSet1);
    command.execute();
    expect(quorumSet.innerQuorumSets).toEqual([innerQSet2]);
    command.revert();
    expect(quorumSet.innerQuorumSets).toEqual([innerQSet2, innerQSet1]);
  });
});
