import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {EntityPropertyUpdate} from "../../../change-queue/changes/entity-property-update";
import {QuorumSetValidatorDelete} from '@/services/change-queue/changes/quorum-set-validator-delete';

describe("quorum set delete validator", () => {

    test('QuorumSet delete validator', () => {
        let quorumSet = new QuorumSet();
        quorumSet.validators = ['a', 'b', 'c'];
        let command = new QuorumSetValidatorDelete(quorumSet, 'b');
        command.execute();
        expect(quorumSet.validators).toEqual(['a','c']);
        command.revert();
        expect(quorumSet.validators).toEqual(['a', 'c', 'b']);
    });
});
