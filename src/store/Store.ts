import axios from 'axios';
import {
    Network,
    Node,
    Organization,
    OrganizationId,
    OrganizationSnapShot,
    PublicKey,
    QuorumSet, TrustGraphBuilder
} from '@stellarbeat/js-stellar-domain';
import {Change, ChangeQueue} from '@/services/change-queue/change-queue';
import {EntityPropertyUpdate} from '@/services/change-queue/changes/entity-property-update';
import {QuorumSetValidatorDelete} from '@/services/change-queue/changes/quorum-set-validator-delete';
import {InnerQuorumSetDelete} from '@/services/change-queue/changes/inner-quorum-set-delete';
import {InnerQuorumSetAdd} from '@/services/change-queue/changes/inner-quorum-set-add';
import {QuorumSetValidatorsAdd} from '@/services/change-queue/changes/quorum-set-validators-add';
import {NetworkAddNode} from '@/services/change-queue/changes/network-add-node';
import Vue from 'vue';
import StatisticsStore from '@/store/StatisticsStore';
import NodeStatisticsStore from '@/store/NodeStatisticsStore';
import OrganizationStatisticsStore from '@/store/OrganizationStatisticsStore';
import NetworkStatisticsStore from '@/store/NetworkStatisticsStore';
import {NodeSnapShot} from '@stellarbeat/js-stellar-domain/lib/node-snap-shot';
import {QuorumSetOrganizationsAdd} from '@/services/change-queue/changes/quorum-set-organizations-add';
import LocalNetworks from '@/store/LocalNetworks';
import {AggregateChange} from '@/services/change-queue/changes/aggregate-change';

type NetworkId = string;

export default class Store {
    public measurementsStartDate: Date = new Date('2019-06-01');
    public isLoading: boolean = true;
    public fetchingDataFailed: boolean = false;
    public network!: Network;
    public changeQueue: ChangeQueue = new ChangeQueue();
    public networkUpdated: number = 0;
    public centerNode?:Node = undefined;
    public selectedNode?:Node = undefined;
    public availableNetworks = ['public', 'test', 'fbas', 'fbas2'];
    public availableNetworksPretty!:Map<string, string>;
    public networkId: NetworkId = 'public';
    public isLocalNetwork: boolean = false;
    public selectedOrganization?:Organization = undefined;
    protected measurementStore: StatisticsStore = new StatisticsStore(this);
    public nodeMeasurementStore: NodeStatisticsStore = new NodeStatisticsStore(this.measurementStore);
    public networkMeasurementStore: NetworkStatisticsStore = new NetworkStatisticsStore(this.measurementStore);
    public organizationMeasurementStore: OrganizationStatisticsStore = new OrganizationStatisticsStore(this.measurementStore);
    public isHaltingAnalysisVisible: boolean = false;
    public isNetworkAnalysisVisible: boolean = false;
    public isTimeTravel: boolean = false;

    public includeWatcherNodes: boolean = true;
    public watcherNodeFilter = (node:Node) => {
        return this.includeWatcherNodes || node.isValidator
    };

    protected _haltingAnalysisPublicKey?: string = undefined;

    protected _uniqueId = 0;

    constructor() {
        this.availableNetworksPretty = new Map();
        this.availableNetworksPretty.set('public', 'Public network');
        this.availableNetworksPretty.set('test', 'Testnet');
        this.availableNetworksPretty.set('fbas', 'FBAS demo');
        this.availableNetworksPretty.set('fbas2', 'FBAS QI demo');
    }

    hydrateNetwork(networkDTO: object, networkId: string){
        let network = Network.fromJSON(networkDTO);
        this.networkId = networkId;
        if(['fbas', 'fbas2'].includes(this.networkId)){
            this.isLocalNetwork = true;
        }
        Vue.set(this, 'network', network);
        this.isLoading = false;
    }
    public getNetworkIdPretty(networkId?:string): string|undefined {
        if(!networkId)
            networkId = this.networkId;
        return this.availableNetworksPretty.get(networkId);
    }

    getUniqueId(){
        return this._uniqueId ++;
    }

    public showHaltingAnalysis(node: Node){
        this.isHaltingAnalysisVisible = true;
        this._haltingAnalysisPublicKey = node.publicKey;
    }

    get haltingAnalysisPublicKey() {
        return this._haltingAnalysisPublicKey;
    }

    getApiUrl(): string{
        let key = "VUE_APP_" + this.networkId.toUpperCase() + "_API_URL";
        let url = process.env[key];
        if(!url)
            return '';

        return url;
    }

    async fetchNodeSnapshotsByPublicKey(id:PublicKey):Promise<NodeSnapShot[]> {
        let params:any = {};
        params['at'] = this.network.crawlDate;
        let result = await axios.get(this.getApiUrl() + '/v1/node/' + id + '/snapshots', {params});
        if (result.data) {
            return result.data.map((item:object) => NodeSnapShot.fromJSON(item));
        }

        return [];
    }

    async fetchNodeSnapshots():Promise<NodeSnapShot[]> {
        let params:any = {};
        params['at'] = this.network.crawlDate;
        let result = await axios.get(this.getApiUrl() + '/v1/node-snapshots', {params});
        if (result.data) {
            return result.data.map((item:object) => NodeSnapShot.fromJSON(item));
        }

        return [];
    }

    async fetchOrganizationSnapshotsById(id:OrganizationId):Promise<Object[]> {
        let params:any = {};
        params['at'] = this.network.crawlDate;
        let result = await axios.get(this.getApiUrl() + '/v1/organization/' + id + '/snapshots', {params});
        if (result.data) {
            return result.data.map((item:object) => OrganizationSnapShot.fromJSON(item));
        }

        return [];
    }

    async fetchOrganizationSnapshots():Promise<OrganizationSnapShot[]> {
        let params:any = {};
        params['at'] = this.network.crawlDate;
        let result = await axios.get(this.getApiUrl() + '/v1/organization-snapshots', {params});
        if (result.data) {
            return result.data.map((item:object) => OrganizationSnapShot.fromJSON(item));
        }

        return [];
    }

    async fetchData(time?:Date): Promise<void> {
        this.fetchingDataFailed = false;
        if(this.isSimulation)
            this.changeQueue.reset();

        if(this.networkId === 'fbas'){
            this.loadFBAS();
            this.isLocalNetwork = true;
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }

        if(this.networkId === 'fbas2'){
            this.loadFBAS2();
            this.isLocalNetwork = true;
            return new Promise(function(resolve, reject) {
                resolve();
            });
        }
        this.isLocalNetwork = false;
        try {
            let params:any = {};
            if(time){
                params['at'] = time.toISOString();
                this.isTimeTravel = true;
            }
            else
                this.isTimeTravel = false;
            this.isLoading = true;
            let result = await axios.get(this.getApiUrl() + '/v1', {params});
            if (result.data) {
                let network = Network.fromJSON(result.data);
                Vue.set(this, 'network', network);
                this.isLoading = false;
                return;
            } else {
                this.fetchingDataFailed = true;
                this.isLoading = false;
            }
        } catch (error) {
            this.fetchingDataFailed = true;
            this.isLoading = false;
        }
    }

    public toggleOrganizationAvailability(organization: Organization){
        let targetAvailability = !organization.subQuorumAvailable;
        let aggregateChange = new AggregateChange([
            new EntityPropertyUpdate(organization, 'subQuorumAvailable', targetAvailability),
            ...organization.validators.map(validator => {
                let node = this.network.getNodeByPublicKey(validator);
                return new EntityPropertyUpdate(node, 'isValidating', targetAvailability);
            })
        ])
        this.processChange(aggregateChange);
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
        this.network.modifyNetwork();
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

    public addOrganizations(toQuorumSet: QuorumSet, organizations: Organization[]) {
        this.processChange(new QuorumSetOrganizationsAdd(toQuorumSet, organizations));
    }

    public addOrganizationToTransitiveQuorumSet(organizations: Organization[]) {
        let transitiveNodes = Array.from(this.network.nodesTrustGraph.networkTransitiveQuorumSet)
            .map(publicKey => this.network.getNodeByPublicKey(publicKey)!);

        let changes:Change[] = [];
        transitiveNodes.forEach(node => {
            changes.push(new QuorumSetOrganizationsAdd(node.quorumSet, organizations));
            changes.push(new EntityPropertyUpdate(node.quorumSet, 'threshold', node.quorumSet.threshold + 1))
        })

        this.processChange(new AggregateChange(changes));
    }

    public processChange(change: Change) {
        this.changeQueue.execute(change);
        this.network.modifyNetwork();
        this.networkUpdated++;
    }

    get isSimulation(): boolean {
        return this.changeQueue.hasUndo() || this.isLocalNetwork;
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
        this.network.modifyNetwork();
        this.networkUpdated++;
    }

    public redoUpdate() {
        if (!this.changeQueue.hasRedo()) {
            return;
        }
        this.changeQueue.redo();
        this.network.modifyNetwork();
        this.networkUpdated++;
    }

    public addNodeToNetwork(node: Node) {
        this.changeQueue.execute(new NetworkAddNode(this.network, node));
        this.network.modifyNetwork(this.network.nodes); //needs better solution
        this.networkUpdated++;
    }

    public resetUpdates() {
        if (!this.changeQueue.hasUndo()) {
            return;
        }
        this.changeQueue.reset();
        this.network.modifyNetwork();
        this.networkUpdated++;
    }

    public loadFBAS() {
        let network = LocalNetworks.getFBASNetwork();
        Vue.set(this, 'network', network);
        this.networkUpdated++;
        this.isLoading = false;
    }

    public loadFBAS2() {
        let network = LocalNetworks.getFBAS2Network();
        Vue.set(this, 'network', network);
        this.networkUpdated++;
        this.isLoading = false;
    }

    public capitalize(word: string) {
        if (typeof word !== 'string') return '';
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    //todo: needs better location
    getOrganizationDangers(organization: Organization){
        if(this.network.isOrganizationBlocked(organization)){
            return 'Organization blocked: Validators not reaching quorumset thresholds'
        } else {
            return 'More then 50% of its validators are failing';
        }
    }
    //todo: move
    getOrganizationFailAt(organization: Organization) {
        let nrOfValidatingNodes = organization.validators
            .map(validator => this.network.getNodeByPublicKey(validator))
            .filter(validator => validator !== undefined)
            .filter(node => !this.network.isNodeFailing(node!)).length;

        return nrOfValidatingNodes - organization.subQuorumThreshold + 1;
    }
}