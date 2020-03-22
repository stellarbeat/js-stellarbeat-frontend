import axios from 'axios';
import {Network, Node, Organization, OrganizationId, PublicKey, QuorumSet} from '@stellarbeat/js-stellar-domain';
import {Change, ChangeQueue} from '@/services/change-queue/change-queue';
import {EntityPropertyUpdate} from '@/services/change-queue/changes/entity-property-update';
import {QuorumSetValidatorDelete} from '@/services/change-queue/changes/quorum-set-validator-delete';
import {InnerQuorumSetDelete} from '@/services/change-queue/changes/inner-quorum-set-delete';
import {InnerQuorumSetAdd} from '@/services/change-queue/changes/inner-quorum-set-add';
import {QuorumSetValidatorsAdd} from '@/services/change-queue/changes/quorum-set-validators-add';
import {NetworkAddNode} from '@/services/change-queue/changes/network-add-node';
import Vue from 'vue';
import MeasurementStore from '@/store/MeasurementStore';
import NodeMeasurementStore from '@/store/NodeMeasurementStore';
import OrganizationMeasurementStore from '@/store/OrganizationMeasurementStore';

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

export type DayStatistic = {
    crawlCount: number,
    propertyCount: number,
    day: Date
}

export default class Store {
    public measurementsStartDate: Date = new Date('2019-06-01');
    public isLoading: boolean = true;
    public fetchingNodeDataFailed: boolean = false;
    public network!: Network;
    public changeQueue: ChangeQueue = new ChangeQueue();
    public networkUpdated: number = 0;
    public centerNode?:Node = undefined;
    public selectedNode?:Node = undefined;
    public selectedOrganization?:Organization = undefined;
    protected measurementStore: MeasurementStore = new MeasurementStore();
    public nodeMeasurementStore: NodeMeasurementStore = new NodeMeasurementStore(this.measurementStore);
    public organizationMeasurementStore: OrganizationMeasurementStore = new OrganizationMeasurementStore(this.measurementStore);

    protected _uniqueId = 0;

    getUniqueId(){
        return this._uniqueId ++;
    }

    async fetchData(time?:Date): Promise<void> {
        try {
            let params:any = {};
            if(time)
                params['at'] = time.toISOString();

            let result = await axios.get(process.env.VUE_APP_API_URL + '/v2/all', {params});
            if (result.data.nodes) {
                let nodes = result.data.nodes
                    .map((node: any) => Node.fromJSON(node));

                let organizations = [];
                if (result.data.organizations) {
                    organizations = result.data.organizations.map((organization: any) => Organization.fromJSON(organization));
                }

                Vue.set(this, 'network', new Network(nodes, organizations, new Date(result.data.time)));

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