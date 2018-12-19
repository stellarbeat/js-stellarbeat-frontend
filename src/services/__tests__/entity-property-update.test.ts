import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {EntityPropertyUpdate} from "../entity-property-update";

describe("entity property update", () => {

    test('Node property', () => {
        let node = new Node('localhost');
        node.active = false;
        let command = new EntityPropertyUpdate(node, 'active', true);
        command.execute();
        expect(node.active).toBeTruthy();
        command.revert();
        expect(node.active).toBeFalsy();
    });

    test('QuorumSet validators', () => {
        let quorumSet = new QuorumSet();
        quorumSet.validators = ['a', 'b'];
        let command = new EntityPropertyUpdate(quorumSet, 'validators', ['a', 'b', 'c']);
        command.execute();
        expect(quorumSet.validators).toEqual(['a', 'b', 'c']);
        command.revert();
        expect(quorumSet.validators).toEqual(['a', 'b']);
    });

    test('QuorumSet add innerQuorumSet', () => {
        let quorumSet = new QuorumSet();
        let innerQuorumSet1 = new QuorumSet();
        let newInnerQuorumSet = new QuorumSet();
        quorumSet.innerQuorumSets = [innerQuorumSet1];

        let command = new EntityPropertyUpdate(
            quorumSet,
            'innerQuorumSets',
            [innerQuorumSet1, newInnerQuorumSet]
        );
        command.execute();
        expect(quorumSet.innerQuorumSets).toEqual([innerQuorumSet1, newInnerQuorumSet]);
        command.revert();
        expect(quorumSet.innerQuorumSets).toEqual([innerQuorumSet1]);
    });

    test('QuorumSet remove innerQuorumSet', () => {
        let quorumSet = new QuorumSet();
        let innerQuorumSet1 = new QuorumSet();
        let innerQuorumSet2 = new QuorumSet();
        quorumSet.innerQuorumSets = [innerQuorumSet1, innerQuorumSet2];

        let command = new EntityPropertyUpdate(
            quorumSet,
            'innerQuorumSets',
            [innerQuorumSet1]
        );
        command.execute();
        expect(quorumSet.innerQuorumSets).toEqual([innerQuorumSet1]);
        command.revert();
        expect(quorumSet.innerQuorumSets).toEqual([innerQuorumSet1, innerQuorumSet2]);
    });
});
