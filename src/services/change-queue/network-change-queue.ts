import {EntityPropertyUpdate} from "@/services/change-queue/changes/entity-property-update";
import {Network} from '@stellarbeat/js-stellar-domain';

export interface NetworkChange {
    execute():void;
    revert():void;
}
/**
 * todo: limit number of stored changes (memory usage)
 */
export class NetworkChangeQueue
{
    protected _changesQueue: NetworkChange[];
    protected _changesQueueIndex: number;
    protected _network: Network;

    constructor(network: Network) {
        this._changesQueue = [];
        this._changesQueueIndex = 0;
        this._network = network;
    }

    execute(change:NetworkChange): void {
        change.execute();
        this._network.recalculateNetwork();
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