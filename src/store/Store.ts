import axios from 'axios';
import {
    Network,
    Node,
    Organization,
    OrganizationId,
    OrganizationSnapShot,
    PublicKey,
    QuorumSet
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
            this.loadFbas();
            this.isLocalNetwork = true;
            return;
        }

        if(this.networkId === 'fbas2'){
            //this.loadFbas2();
            this.isLocalNetwork = true;
            return;
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

    public addOrganizations(toQuorumSet: QuorumSet, organizations: Organization[]) {
        this.processChange(new QuorumSetOrganizationsAdd(toQuorumSet, organizations));
    }

    protected processChange(change: Change) {
        this.changeQueue.execute(change);
        this.network.updateNetwork();
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

    public loadFbas() {
        let organizations = [{
            id: 'sp',
            name: 'Satoshipay',
            validators: ['sp1', 'sp2']
        }, {
            id: 'lb',
            name: 'LOBSTR',
            validators: ['lb1', 'lb2']
        }, {
            id: 'sdf',
            name: 'SDF',
            validators: ['sdf1', 'sdf2']
        }].map(organization => Organization.fromJSON(organization)!);
        let nodes = [
            {
                "ip": "localhost",
                "port": 11625,
                "publicKey": "sdf1",
                "name": "SDF1",
                "active": true,
                "overLoaded": false,
                "organizationId": 'sdf',
                "quorumSet": {
                    "threshold": 2,
                    "validators": [],
                    "innerQuorumSets": [
                        {
                            "threshold": 1,
                            "validators": [
                                "lb1",
                                "lb2"
                            ],
                            "innerQuorumSets": []
                        },
                        {
                            "threshold": 1,
                            "validators": [
                                "sp1",
                                "sp2"
                            ],
                            "innerQuorumSets": []
                        }
                    ]
                },
                "isValidator": true,
                "isValidating": true
            },
            {
                "ip": "localhost",
                "port": 11625,
                "publicKey": "sdf2",
                "name": "SDF2",
                "active": true,
                "overLoaded": false,
                "organizationId": 'sdf',
                "quorumSet": {
                    "threshold": 2,
                    "validators": [],
                    "innerQuorumSets": [
                        {
                            "threshold": 1,
                            "validators": [
                                "lb1",
                                "lb2"
                            ],
                            "innerQuorumSets": []
                        },
                        {
                            "threshold": 1,
                            "validators": [
                                "sp1",
                                "sp2"
                            ],
                            "innerQuorumSets": []
                        }
                    ]
                },
                "isValidator": true,
                "isValidating": true
            },
            {
                "ip": "localhost",
                "port": 11625,
                "publicKey": "lb1",
                "name": "LOBSTR1",
                "active": true,
                "overLoaded": false,
                "organizationId": 'lb',
                "quorumSet": {
                    "threshold": 2,
                    "validators": [],
                    "innerQuorumSets": [
                        {
                            "threshold": 1,
                            "validators": [
                                "sdf1",
                                "sdf2"
                            ],
                            "innerQuorumSets": []
                        },
                        {
                            "threshold": 1,
                            "validators": [
                                "sp1",
                                "sp2"
                            ],
                            "innerQuorumSets": []
                        }
                    ]
                },
                "isValidator": true,
                "isValidating": true
            },
            {
                "ip": "localhost",
                "port": 11625,
                "publicKey": "lb2",
                "name": "LOBSTR2",
                "active": true,
                "overLoaded": false,
                "organizationId": 'lb',
                "quorumSet": {
                    "threshold": 2,
                    "validators": [],
                    "innerQuorumSets": [
                        {
                            "threshold": 1,
                            "validators": [
                                "sdf1",
                                "sdf2"
                            ],
                            "innerQuorumSets": []
                        },
                        {
                            "threshold": 1,
                            "validators": [
                                "sp1",
                                "sp2"
                            ],
                            "innerQuorumSets": []
                        }
                    ]
                },
                "isValidator": true,
                "isValidating": true
            },
            {
                "ip": "localhost",
                "port": 11625,
                "publicKey": "sp1",
                "name": "SatoshiPay1",
                "organizationId": 'sp',
                "active": true,
                "overLoaded": false,
                "quorumSet": {
                    "threshold": 2,
                    "validators": [],
                    "innerQuorumSets": [
                        {
                            "threshold": 1,
                            "validators": [
                                "sdf1",
                                "sdf2"
                            ],
                            "innerQuorumSets": []
                        },
                        {
                            "threshold": 1,
                            "validators": [
                                "lb1",
                                "lb2"
                            ],
                            "innerQuorumSets": []
                        }
                    ]
                },
                "isValidator": true,
                "isValidating": true
            },
            {
                "ip": "localhost",
                "port": 11625,
                "publicKey": "sp2",
                "name": "SatoshiPay2",
                "active": true,
                "overLoaded": false,
                "organizationId": 'sp',
                "quorumSet": {
                    "threshold": 2,
                    "validators": [],
                    "innerQuorumSets": [
                        {
                            "threshold": 1,
                            "validators": [
                                "sdf1",
                                "sdf2"
                            ],
                            "innerQuorumSets": []
                        },
                        {
                            "threshold": 1,
                            "validators": [
                                "lb1",
                                "lb2"
                            ],
                            "innerQuorumSets": []
                        }
                    ]
                },
                "isValidator": true,
                "isValidating": true
            }
        ].map(node => Node.fromJSON(node));
        let network = new Network(nodes, organizations);
        Vue.set(this, 'network', network);
        this.isLoading = false;
    }
}