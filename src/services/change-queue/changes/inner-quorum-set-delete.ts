import {QuorumSet, Node} from '@stellarbeat/js-stellar-domain';
import {Change} from '@/services/change-queue/change-queue';

export class InnerQuorumSetDelete implements Change {
    _quorumSet: QuorumSet;
    _innerQuorumSet: QuorumSet;

    constructor(quorumSet:QuorumSet, innerQuorumSet:QuorumSet) {
        this._quorumSet = quorumSet;
        this._innerQuorumSet = innerQuorumSet;
    }

    execute(): void {
        this._quorumSet.innerQuorumSets.splice(
            this._quorumSet.innerQuorumSets.indexOf(this._innerQuorumSet),
            1
        );
    }

    revert(): void {
        this._quorumSet.innerQuorumSets.push(this._innerQuorumSet);
    }
}