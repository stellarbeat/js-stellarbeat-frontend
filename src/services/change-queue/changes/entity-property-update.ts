import { NetworkChange } from "@/services/change-queue/network-change-queue";
import { Node, Organization, QuorumSet } from "@stellarbeat/js-stellar-domain";

type Entity = Node | Organization | QuorumSet;

export class EntityPropertyUpdate implements NetworkChange {
  protected _originalValue: unknown;
  protected _entity: Entity;
  protected _propertyName: string;
  protected _newValue: unknown;

  constructor(entity: Entity, propertyName: string, newValue: unknown) {
    this._entity = entity;
    this._newValue = newValue;
    this._propertyName = propertyName;
    //@ts-ignore
    this._originalValue = entity[propertyName];
  }

  execute(): void {
    //@ts-ignore
    this._entity[this._propertyName] = this._newValue;
  }

  revert(): void {
    //@ts-ignore
    this._entity[this._propertyName] = this._originalValue;
  }

  toString(): string {
    return "update " + this._propertyName;
  }
}
