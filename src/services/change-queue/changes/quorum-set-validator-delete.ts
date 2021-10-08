import { QuorumSet } from "@stellarbeat/js-stellar-domain";
import { NetworkChange } from "@/services/change-queue/network-change-queue";

type PublicKey = string;

export class QuorumSetValidatorDelete implements NetworkChange {
  _quorumSet: QuorumSet;
  _validator: PublicKey;

  constructor(quorumSet: QuorumSet, validator: PublicKey) {
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
