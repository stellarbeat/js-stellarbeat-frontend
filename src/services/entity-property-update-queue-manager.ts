import {EntityPropertyUpdate} from "./entity-property-update";

/**
 *
 */
export class EntityPropertyUpdateQueueManager
{
    protected _updatesQueue: EntityPropertyUpdate[];
    protected _updatesQueueIndex: number;

    constructor() {
        this._updatesQueue = [];
        this._updatesQueueIndex = 0;
    }

    execute(update:EntityPropertyUpdate): void {
        update.execute();
        if(this._updatesQueueIndex !== this._updatesQueue.length) {
            this._updatesQueue = this._updatesQueue.splice(0, this._updatesQueueIndex);
        }
        this._updatesQueue.push(update);
        this._updatesQueueIndex ++;
    }

    undo(): void {
        if(!this.hasUndo()){
            return;
        }

        this._updatesQueue[this._updatesQueueIndex - 1].revert();
        this._updatesQueueIndex --;
    }

    hasUndo(): boolean {
        return this._updatesQueueIndex > 0;
    }

    redo(): void {
        if(!this.hasRedo()) {
            return;
        }

        this._updatesQueue[this._updatesQueueIndex].execute();
        this._updatesQueueIndex ++;
    }

    hasRedo(): boolean {
        return this._updatesQueueIndex < this._updatesQueue.length;
    }

    undoQueueToString(): Array<string> {
        return this._updatesQueue
            .splice(0, this._updatesQueueIndex)
            .map((update:EntityPropertyUpdate) => update.toString())
            .reverse();
    }

    redoQueueToString(): Array<string> {
        return this._updatesQueue
            .splice(this._updatesQueueIndex, this._updatesQueue.length)
            .map((update:EntityPropertyUpdate) => update.toString());
    }

    reset(): void {
        while(this.hasUndo()) {
            this.undo();
        }
    }
}