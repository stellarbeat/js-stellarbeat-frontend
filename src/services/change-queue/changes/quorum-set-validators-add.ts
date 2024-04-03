import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { type NetworkChange } from "@/services/change-queue/network-change-queue";

type PublicKey = string;

export class QuorumSetValidatorsAdd implements NetworkChange {
  _quorumSet: QuorumSet;
  _validators: PublicKey[];

  constructor(quorumSet: QuorumSet, validators: PublicKey[]) {
    this._quorumSet = quorumSet;
    this._validators = validators;
  }

  execute(): void {
    this._quorumSet.validators.push(...this._validators);
  }

  revert(): void {
    this._validators.forEach((validator: PublicKey) => {
      this._quorumSet.validators.splice(
        this._quorumSet.validators.indexOf(validator),
        1,
      );
    });
  }
}
