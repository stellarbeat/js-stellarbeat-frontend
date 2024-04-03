import { type NetworkChange } from "@/services/change-queue/network-change-queue";

export class AggregateChange implements NetworkChange {
  protected changes: NetworkChange[];
  constructor(changes: NetworkChange[]) {
    this.changes = changes;
  }

  execute(): void {
    this.changes.forEach((change) => {
      change.execute();
    });
  }

  revert(): void {
    this.changes.forEach((change) => {
      change.revert();
    });
  }

  toString(): string {
    return "updates";
  }
}
