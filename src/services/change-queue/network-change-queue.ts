import {Network} from '@stellarbeat/js-stellar-domain';
import NetworkAnalyzer from '@/services/NetworkAnalyzer';

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
    protected _networkAnalyzer: NetworkAnalyzer;

    constructor(network: Network, networkAnalyzer: NetworkAnalyzer) {
        this._changesQueue = [];
        this._changesQueueIndex = 0;
        this._network = network;
        this._networkAnalyzer = networkAnalyzer;
    }

    execute(change:NetworkChange): void {
        change.execute();
        this._network.recalculateNetwork();
        this._networkAnalyzer.analyzeNetwork();
        if(this._changesQueueIndex !== this._changesQueue.length) {
            this._changesQueue = this._changesQueue.splice(0, this._changesQueueIndex);
        }
        this._changesQueue.push(change);
        this._changesQueueIndex ++;
    }

    undo(singleStep: boolean = true): void {
        if(!this.hasUndo()){
            return;
        }

        this._changesQueue[this._changesQueueIndex - 1].revert();
        if(singleStep){
            this._network.recalculateNetwork();
            this._networkAnalyzer.analyzeNetwork();
        }
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
        this._network.recalculateNetwork();
        this._networkAnalyzer.analyzeNetwork();
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
            this.undo(false);
        }
        this._network.recalculateNetwork();
        this._networkAnalyzer.analyzeNetwork();
    }
}