import {Node, Organization, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {QuorumSetOrganizationsAdd} from '@/services/change-queue/changes/quorum-set-organizations-add';

describe("quorum set add organization", () => {

    test('QuorumSet add organization', () => {
        let organization = new Organization('1', 'test');
        organization.validators.push(...['a', 'b']);
        let quorumSet = new QuorumSet();
        let command = new QuorumSetOrganizationsAdd(quorumSet, [organization]);
        command.execute();
        expect(quorumSet.innerQuorumSets).toHaveLength(1);
        expect(quorumSet.innerQuorumSets[0].validators).toEqual(['a', 'b']);
        expect(quorumSet.innerQuorumSets[0].threshold).toEqual(organization.subQuorumThreshold);
        command.revert();
        expect(quorumSet.innerQuorumSets).toHaveLength(0);
    });
});
