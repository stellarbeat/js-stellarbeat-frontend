import axios from 'axios';
import {Network, Node, Organization, PublicKey, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {Change, ChangeQueue} from '@/services/change-queue/change-queue';
import {EntityPropertyUpdate} from '@/services/change-queue/changes/entity-property-update';
import {QuorumSetValidatorDelete} from '@/services/change-queue/changes/quorum-set-validator-delete';
import {InnerQuorumSetDelete} from '@/services/change-queue/changes/inner-quorum-set-delete';
import {InnerQuorumSetAdd} from '@/services/change-queue/changes/inner-quorum-set-add';
import {QuorumSetValidatorsAdd} from '@/services/change-queue/changes/quorum-set-validators-add';
import {NetworkAddNode} from '@/services/change-queue/changes/network-add-node';
import Vue from "vue";

export type QuorumMonitorStore = {
    centerNode: Node | undefined,
    selectedNode: Node | undefined
}
export type ValidatingStatistic = {
    publicKey: PublicKey,
    crawlCount: number,
    isValidatingCount: number,
    day: Date
}
export interface NodeDayStatistics{
    day: Date
    isActiveCount: number;
    isValidatingCount: number;
    isFullValidatorCount: number;
    isOverloadedCount: number;
    indexSum: number;
    crawlCount: number;
}

export type DayStatistic = {
    crawlCount: number,
    propertyCount: number,
    day: Date
}

export default class Store {
    public measurementsStartDate: Date = new Date('2019-05-31');
    public isLoading: boolean = true;
    public fetchingNodeDataFailed: boolean = false;
    public network!: Network;
    public crawlDate!: Date;
    public changeQueue: ChangeQueue = new ChangeQueue();
    public networkUpdated: number = 0;
    public quorumMonitorStore: QuorumMonitorStore = {
        centerNode: undefined,
        selectedNode: undefined,
    };
    protected _uniqueId = 0;

    get uniqueId(){
        return this._uniqueId ++;
    }

    async fetchData(time?:Date): Promise<void> {
        try {
            let result = await axios.get(process.env.VUE_APP_API_URL + process.env.VUE_APP_API_ALL_SUFFIX);
            if (result.data.nodes) {
                let nodes = result.data.nodes
                    .map((node: any) => Node.fromJSON(node));

                let organizations = [];
                if (result.data.organizations) {
                    organizations = result.data.organizations.map((organization: any) => Organization.fromJSON(organization));
                }
                Vue.set(this, 'network', new Network(nodes, organizations));
                this.crawlDate = this.network.latestCrawlDate;

                return;
            } else {
                this.fetchingNodeDataFailed = true;
            }
        } catch (error) {
            this.fetchingNodeDataFailed = true;
        }
    }

    async timeTravelTo(time:Date): Promise<void> {
        try {
            let params = {
                at: time.toDateString()
            };

            let result = await axios.get(process.env.VUE_APP_API_URL + process.env.VUE_APP_API_ALL_V2_SUFFIX, {params});
            if (result.data.nodes) {
                let nodes = result.data.nodes
                    .map((node: any) => Node.fromJSON(node));

                let organizations = [];
                if (result.data.organizations) {
                    organizations = result.data.organizations.map((organization: any) => Organization.fromJSON(organization));
                }
                this.network = new Network(nodes, organizations);
                this.crawlDate = new Date(result.data.time);

                return;
            } else {
                this.fetchingNodeDataFailed = true;
            }
        } catch (error) {
            this.fetchingNodeDataFailed = true;
        }
    }

    public toggleActive(node: Node) {
        this.processChange(new EntityPropertyUpdate(node, 'active', !node.active));
    }

    public toggleValidating(node: Node) {
        if (!node.active)
            this.changeQueue.execute(new EntityPropertyUpdate(node, 'active', !node.active));
        this.processChange(new EntityPropertyUpdate(node, 'isValidating', !node.isValidating));
    }

    async fetchValidatingStatistics(publicKey: PublicKey, from?: Date, to?: Date): Promise<ValidatingStatistic[]> {
        let params:any = {};
        if(from)
            params.from = from.toDateString();
        if(to)
            params.to = to.toDateString();
        let result = await axios.get(process.env.VUE_APP_API_URL + process.env.VUE_APP_API_VALIDATING_STATS_SUFFIX + '/' + publicKey, {
            params
        });

        return result.data.map((stat:{
            publicKey: PublicKey,
            crawlCount: number,
            isValidatingCount: number,
            day: string
        }) => {
            return {
                publicKey: stat.publicKey,
                isValidatingCount: stat.isValidatingCount,
                crawlCount: stat.crawlCount,
                day: new Date(stat.day)
            };
        });
    }

    async fetchNodeStatistics(publicKey: PublicKey, from?: Date, to?: Date): Promise<NodeDayStatistics[]> {
        let params:any = {};
        if(from)
            params.from = from.toDateString();
        if(to)
            params.to = to.toDateString();
        let result = await axios.get(process.env.VUE_APP_API_URL + process.env.VUE_APP_API_NODE_STATS_SUFFIX + '/' + publicKey, {
            params
        });

        result.data.forEach((stat:any) => stat.day = new Date(stat.day));
        return result.data;
    }

    async fetchNodeValidatingDayStatistics(publicKey: PublicKey, from?: Date, to?: Date): Promise<DayStatistic[]> {
        let nodeStatistics = await this.fetchNodeStatistics(publicKey, from, to);

        return nodeStatistics.map(nodeStat => {
            return {
                day: nodeStat.day,
                propertyCount: nodeStat.isValidatingCount,
                crawlCount: nodeStat.crawlCount
            }
        })
    }
    async fetchNodeFullValidatorDayStatistics(publicKey: PublicKey, from?: Date, to?: Date): Promise<DayStatistic[]> {
        let nodeStatistics = await this.fetchNodeStatistics(publicKey, from, to);

        return nodeStatistics.map(nodeStat => {
            return {
                day: nodeStat.day,
                propertyCount: nodeStat.isFullValidatorCount,
                crawlCount: nodeStat.crawlCount
            }
        })
    }

    public updateValidatingStates(updates: Array<{ 'publicKey': PublicKey, 'validating': boolean }>) {
        updates.forEach(update => {
            let node = this.network.getNodeByPublicKey(update.publicKey);
            this.changeQueue.execute(new EntityPropertyUpdate(node, 'isValidating', update.validating));
        });
        this.network.updateNetwork();
        this.networkUpdated++;
    }

    public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
        if (quorumSet.threshold === newThreshold) {
            return;
        }

        this.processChange(new EntityPropertyUpdate(quorumSet, 'threshold', newThreshold));
    }

    public deleteValidatorFromQuorumSet(quorumSet: QuorumSet, validator: Node) {
        this.processChange(new QuorumSetValidatorDelete(quorumSet, validator.publicKey!));
    }

    public deleteInnerQuorumSet(quorumSet: QuorumSet, fromQuorumSet: QuorumSet) {
        this.processChange(new InnerQuorumSetDelete(fromQuorumSet, quorumSet));
    }

    public addInnerQuorumSet(toQuorumSet: QuorumSet) {
        this.processChange(new InnerQuorumSetAdd(toQuorumSet));
    }

    public addValidators(toQuorumSet: QuorumSet, validators: string[]) {
        this.processChange(new QuorumSetValidatorsAdd(toQuorumSet, validators));
    }

    protected processChange(change: Change) {
        this.changeQueue.execute(change);
        this.network.updateNetwork();
        this.networkUpdated++;
    }

    get isSimulation(): boolean {
        return this.changeQueue.hasUndo();
    }

    get hasUndo(): boolean {
        return this.changeQueue.hasUndo();
    }

    get hasRedo(): boolean {
        return this.changeQueue.hasRedo();
    }

    public undoUpdate() {
        if (!this.changeQueue.hasUndo()) {
            return;
        }
        this.changeQueue.undo();
        this.network.updateNetwork();
        this.networkUpdated++;
    }

    public redoUpdate() {
        if (!this.changeQueue.hasRedo()) {
            return;
        }
        this.changeQueue.redo();
        this.network.updateNetwork();
        this.networkUpdated++;
    }

    public addNodeToNetwork(node: Node) {
        this.changeQueue.execute(new NetworkAddNode(this.network, node));
        this.network.updateNetwork(this.network.nodes); //needs better solution
        this.networkUpdated++;
    }

    public resetUpdates() {
        if (!this.changeQueue.hasUndo()) {
            return;
        }
        this.changeQueue.reset();
        this.network.updateNetwork();
        this.networkUpdated++;
    }
}