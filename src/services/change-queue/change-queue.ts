import {EntityPropertyUpdate} from "@/services/change-queue/changes/entity-property-update";

export interface Change {
    execute():void;
    revert():void;
}
/**
 *
 */
export class ChangeQueue
{
    protected _changesQueue: Change[];
    protected _changesQueueIndex: number;

    constructor() {
        this._changesQueue = [];
        this._changesQueueIndex = 0;
    }

    execute(change:Change): void {
        change.execute();
        if(this._changesQueueIndex !== this._changesQueue.length) {
            this._changesQueue = this._changesQueue.splice(0, this._changesQueueIndex);
        }
        this._changesQueue.push(change);
        this._changesQueueIndex ++;
    }

    undo(): void {
        if(!this.hasUndo()){
            return;
        }

        this._changesQueue[this._changesQueueIndex - 1].revert();
        this._changesQueueIndex --;
    }

    hasUndo(): boolean {
        return this._changesQueueIndex > 0;
    }

    redo(): void {
        if(!this.hasRedo()) {
            return;
        }

        this._changesQueue[this._changesQueueIndex].execute();
        this._changesQueueIndex ++;
    }

    hasRedo(): boolean {
        return this._changesQueueIndex < this._changesQueue.length;
    }

    /*undoQueueToString(): Array<string> {
        return this._changesQueue
            .splice(0, this._changesQueueIndex)
            .map((update:EntityPropertyUpdate) => update.toString())
            .reverse();
    }

    redoQueueToString(): Array<string> {
        return this._changesQueue
            .splice(this._changesQueueIndex, this._changesQueue.length)
            .map((update:EntityPropertyUpdate) => update.toString());
    }*/

    reset(): void {
        while(this.hasUndo()) {
            this.undo();
        }
    }
}