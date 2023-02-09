import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { InnerQuorumSetAdd } from "@/services/change-queue/changes/inner-quorum-set-add";

describe("quorum set add inner quorum set", () => {
  test("quorumSet add inner quorumSet", () => {
    const quorumSet = new QuorumSet();
    const innerQSet1 = new QuorumSet();
    const innerQSet2 = new QuorumSet();

    quorumSet.innerQuorumSets.push(innerQSet1, innerQSet2);

    const command = new InnerQuorumSetAdd(quorumSet);
    command.execute();
    expect(quorumSet.innerQuorumSets.length).toEqual(3);
    command.revert();
    expect(quorumSet.innerQuorumSets).toEqual([innerQSet1, innerQSet2]);
  });
});
