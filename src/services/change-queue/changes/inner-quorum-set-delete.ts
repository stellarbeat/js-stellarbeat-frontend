import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { NetworkChange } from "@/services/change-queue/network-change-queue";

export class InnerQuorumSetDelete implements NetworkChange {
  _quorumSet: QuorumSet;
  _innerQuorumSet: QuorumSet;
  _index = 0;

  constructor(quorumSet: QuorumSet, innerQuorumSet: QuorumSet) {
    this._quorumSet = quorumSet;
    this._innerQuorumSet = innerQuorumSet;
  }

  execute(): void {
    this._index = this._quorumSet.innerQuorumSets.indexOf(this._innerQuorumSet);
    this._quorumSet.innerQuorumSets.splice(this._index, 1);
  }

  revert(): void {
    this._quorumSet.innerQuorumSets.splice(
      this._index,
      0,
      this._innerQuorumSet
    );
  }
}
