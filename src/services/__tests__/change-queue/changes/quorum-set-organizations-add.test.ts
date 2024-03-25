import { Organization, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { QuorumSetOrganizationsAdd } from "@/services/change-queue/changes/quorum-set-organizations-add";

describe("quorum set add organization", () => {
  test("QuorumSet add organization", () => {
    const organization = new Organization("1", "test");
    organization.validators.push(...["a", "b"]);
    const quorumSet = new QuorumSet();
    const command = new QuorumSetOrganizationsAdd(quorumSet, [organization]);
    command.execute();
    expect(quorumSet.innerQuorumSets).toHaveLength(1);
    expect(quorumSet.innerQuorumSets[0].validators).toEqual(["a", "b"]);
    expect(quorumSet.innerQuorumSets[0].threshold).toEqual(
      organization.subQuorumThreshold,
    );
    command.revert();
    expect(quorumSet.innerQuorumSets).toHaveLength(0);
  });
});
