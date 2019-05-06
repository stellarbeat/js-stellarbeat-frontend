import {QuorumSet, Node} from '@stellarbeat/js-stellar-domain';
import {Change} from '@/services/change-queue/change-queue';

export class InnerQuorumSetAdd implements Change {
    _quorumSet: QuorumSet;
    _innerQuorumSet: QuorumSet;

    constructor(quorumSet:QuorumSet) {
        this._quorumSet = quorumSet;
        this._innerQuorumSet = new QuorumSet();
        this._innerQuorumSet.threshold = 1;
    }

    execute(): void {
        this._quorumSet.innerQuorumSets.push(this._innerQuorumSet);
    }

    revert(): void {
        this._quorumSet.innerQuorumSets.splice(
            this._quorumSet.innerQuorumSets.indexOf(this._innerQuorumSet),
            1
        );
    }
}