import {QuorumSet, Node} from '@stellarbeat/js-stellar-domain';
import {Change} from '@/services/change-queue/change-queue';

type PublicKey = string;

export class QuorumSetValidatorsAdd implements Change {
    _quorumSet: QuorumSet;
    _validators: PublicKey[];

    constructor(quorumSet:QuorumSet, validators:PublicKey[]) {
        this._quorumSet = quorumSet;
        this._validators = validators;
    }

    execute(): void {
        this._quorumSet.validators.push(...this._validators);
    }

    revert(): void {
        this._validators.forEach((validator:PublicKey) => {
            this._quorumSet.validators.splice(
                this._quorumSet.validators.indexOf(validator),
                1
            );
        });
    }
}