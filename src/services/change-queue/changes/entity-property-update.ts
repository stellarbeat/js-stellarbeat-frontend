import {Change} from '@/services/change-queue/change-queue';

type Entity = any; //any object

export class EntityPropertyUpdate implements Change{
    protected _originalValue:any;
    protected _entity: Entity;
    protected _propertyName: string;
    protected _newValue: any;

    constructor(entity:Entity, propertyName: string, newValue: any) {
        this._entity = entity;
        this._newValue = newValue;
        this._propertyName = propertyName;
        this._originalValue = entity[propertyName];
    }

    execute(): void {
        this._entity[this._propertyName] = this._newValue;
    }

    revert(): void {
        this._entity[this._propertyName] = this._originalValue;
    }

    toString(): string {
        return 'update ' + this._propertyName;
    }
}