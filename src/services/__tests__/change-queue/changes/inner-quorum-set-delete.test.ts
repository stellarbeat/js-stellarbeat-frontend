import {QuorumSet} from '@stellarbeat/js-stellar-domain';
import {InnerQuorumSetDelete} from '@/services/change-queue/changes/inner-quorum-set-delete';

describe("quorum set delete inner quorum set", () => {

    test('quorumSet delete inner quorumSet', () => {
        let quorumSet = new QuorumSet();
        let innerQSet1 = new QuorumSet();
        let innerQSet2 = new QuorumSet();

        quorumSet.innerQuorumSets.push(innerQSet1, innerQSet2);

        let command = new InnerQuorumSetDelete(quorumSet, innerQSet1);
        command.execute();
        expect(quorumSet.innerQuorumSets).toEqual([innerQSet2]);
        command.revert();
        expect(quorumSet.innerQuorumSets).toEqual([innerQSet2, innerQSet1]);
    });
});
