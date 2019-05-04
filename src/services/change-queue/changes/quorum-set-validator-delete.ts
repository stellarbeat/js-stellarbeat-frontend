import {QuorumSet, Node} from '@stellarbeat/js-stellar-domain';
import {Change} from '@/services/change-queue/change-queue';

type PublicKey = string;

export class QuorumSetValidatorDelete implements Change {
    _quorumSet: QuorumSet;
    _validator: PublicKey;

    constructor(quorumSet:QuorumSet, validator:PublicKey) {
        this._quorumSet = quorumSet;
        this._validator = validator;
    }

    execute(): void {
        this._quorumSet.validators.splice(
            this._quorumSet.validators.indexOf(this._validator),
            1
        );
    }

    revert(): void {
        this._quorumSet.validators.push(this._validator);
    }
}