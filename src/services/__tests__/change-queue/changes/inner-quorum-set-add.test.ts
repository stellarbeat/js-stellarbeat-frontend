import {QuorumSet} from '@stellarbeat/js-stellar-domain';
import {InnerQuorumSetDelete} from '@/services/change-queue/changes/inner-quorum-set-delete';
import {InnerQuorumSetAdd} from '@/services/change-queue/changes/inner-quorum-set-add';

describe("quorum set add inner quorum set", () => {

    test('quorumSet add inner quorumSet', () => {
        let quorumSet = new QuorumSet();
        let innerQSet1 = new QuorumSet();
        let innerQSet2 = new QuorumSet();

        quorumSet.innerQuorumSets.push(innerQSet1, innerQSet2);

        let command = new InnerQuorumSetAdd(quorumSet);
        command.execute();
        expect(quorumSet.innerQuorumSets.length).toEqual(3);
        command.revert();
        expect(quorumSet.innerQuorumSets).toEqual([innerQSet1, innerQSet2]);
    });
});
