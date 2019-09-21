<style>
    .red {
        color: #f00;
    }

    .graph-toolbar {
        justify-content: flex-end;
        float: right;
    }

    .progress-bar-striped {
        background-color: #1997c6;
        opacity: 0.6;
    }
</style>

<template>
    <div>
        <div>
            <div class="page-header  mt-2">
                <h1 class="page-title">
                    Quorum Monitor
                    <b-badge v-show="changeQueue.hasUndo()" variant="warning">Simulation</b-badge>

                </h1>
                <div class="page-subtitle">Latest crawl on {{latestCrawlDateString}}</div>
            </div>
            <Statistics :network="network"></Statistics>
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body p-0">
                            <div class="search-bar">
                                <search :nodes="this.network.nodes"
                                        v-on:center-node="onNodeCenter"></search>
                                <UndoRedo
                                        :redoUpdate="redoUpdate" :resetUpdates="resetUpdates"
                                        :undoUpdate="undoUpdate"
                                        :hasUndo="changeQueue.hasUndo()"
                                        :hasRedo="changeQueue.hasRedo()"
                                        class="undo-redo ml-2"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row card-group">
                <div class="col-sm-12 col-lg-8">
                    <div class="card" id="quorum-set-explorer-card">
                        <div class="card-header d-flex">
                            <h3 v-if="false" class="card-title">
                                <full-validator-title :node="selectedNode"/>
                            </h3>
                            <h3 v-else class="card-title">Stellar Public Network
                                <b-badge v-show="changeQueue.hasUndo()" variant="warning">Simulation</b-badge>
                            </h3>
                        </div>
                        <div class="card-body" style="height: 100%">
                            <Graph ref="graph" :network="network"
                                   v-on:center-node="onNodeCenter"
                                   :centerNode="centerNode"
                                   :selectedNode="selectedNode"
                            ></Graph>
                            <div v-show="false" class="text-right pt-1">
                                <GraphLegend></GraphLegend>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-sm-12">
                    <div class="card" v-if="selectedNode">
                        <div class="card-header">
                            <h3 class="card-title">
                                <full-validator-title :node="selectedNode"/>
                            </h3>
                        </div>
                        <div v-if="network.isNodeFailing(selectedNode)" class="card-alert alert alert-danger mb-0">
                            <i class="fe fe-alert-triangle"></i>
                            Node not validating {{network.isQuorumSetFailing(selectedNode, selectedNode.quorumSet) ? ": quorumset not reaching threshold" : ""}}
                        </div>
                        <div class="card-body p-3">
                            <div class="row">
                                <div class="col-12">
                                    <router-view v-on:node-toggle-active="toggleActive"
                                                 v-on:node-toggle-validating="toggleValidating"
                                                 v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                                                 v-on:quorumset-delete-validator="deleteValidatorFromQuorumSet"
                                                 v-on:quorumset-delete-inner-quorumset="deleteInnerQuorumSet"
                                                 v-on:quorumset-add-inner-quorumset="addInnerQuorumSet"
                                                 v-on:quorumset-add-validators="addValidators"
                                                 v-on:center-node="onNodeCenter"
                                                 v-on:show-halting-analysis="onShowHaltingAnalysis"
                                                 :network="network"
                                                 :selectedNode="selectedNode"
                                    >
                                    </router-view>
                                </div>
                            </div>

                        </div>
                        <div class="card-footer p-3">
                            <div class="col-12 pl-0">
                                <b-button v-b-modal.simulate-node-modal size="sm" variant="primary">
                                    <i class="fe fe-plus-circle"></i>
                                    Simulate a new node
                                </b-button>
                                <b-modal
                                        ok-title="Simulate Node" size="lg" id="simulate-node-modal"
                                        title="Simulate a new node"
                                        v-on:ok="simulateNewNode"
                                >
                                    <b-form-input v-model="newNodeName"
                                                  placeholder="Enter a name"></b-form-input>
                                </b-modal>
                            </div>

                        </div>
                    </div>
                    <div class="card" v-else>
                        <div class="card-header">
                            <div class="card-title">Network transitive quorumset</div>
                        </div>
                        <div class="card-body">
                            <node-list :network="network" :nodes="networkTransitiveQuorumSetNodes" :title="nodes"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row row-cards" v-if="showHaltingAnalysis" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>
        <div class="row row-cards">
            <div class="col-12 col-md-6">

                <div class="card mb-2">
                    <div class="card-header">
                        Quorum-set explorer manual
                    </div>
                    <div class="card-body">
                        <Manual></Manual>
                    </div>
                </div>
            </div>
            <!--div class="col-12 col-md-6">
                <div class="card mb-2">
                    <div class="card-header">
                        Options
                    </div>
                    <div class="card-body">
                        <b-row>
                            <b-col cols="12">
                                <label class="custom-switch">
                                    <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                                           v-model="optionNodeActiveBasedOnLatestCrawl">
                                    <span class="custom-switch-indicator"></span>
                                    <span class="custom-switch-description">Use latest crawl results for active status of nodes</span>
                                </label>
                            </b-col>
                        </b-row>
                    </div>
                </div>
            </div!-->
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import Graph from "../components/quorum-monitor/graph/graph.vue";
    import GraphLegend from "../components/quorum-monitor/graph/graph-legend.vue";
    import QuorumSetExplorer from "../components/quorum-monitor/quorum-set-explorer/quorum-set-explorer.vue";
    import Search from "../components/quorum-monitor/search.vue";
    import Statistics from "../components/statistics.vue";
    import Manual from "../components/quorum-monitor/manual.vue";
    import HaltingAnalysis from "@/components/quorum-monitor/halting-analysis/halting-analysis.vue";

    import {Node, Network, QuorumSet, PublicKey} from "@stellarbeat/js-stellar-domain";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import {Change, ChangeQueue} from "@/services/change-queue/change-queue";
    import {EntityPropertyUpdate} from "@/services/change-queue/changes/entity-property-update";
    import UndoRedo from "@/components/quorum-monitor/UndoRedo.vue";
    import {QuorumSetValidatorDelete} from "@/services/change-queue/changes/quorum-set-validator-delete";
    import {InnerQuorumSetDelete} from "@/services/change-queue/changes/inner-quorum-set-delete";
    import {InnerQuorumSetAdd} from "@/services/change-queue/changes/inner-quorum-set-add";
    import {QuorumSetValidatorsAdd} from "@/services/change-queue/changes/quorum-set-validators-add";
    import {NetworkAddNode} from "@/services/change-queue/changes/network-add-node";
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import NodeList from '@/components/quorum-monitor/quorum-set-explorer/node-list.vue';

    @Component({
        name: "quorum-monitor",
        components: {
            NodeList,
            FullValidatorTitle,
            UndoRedo,
            QuorumSetExplorer,
            Graph,
            GraphLegend,
            Search,
            Statistics,
            Manual,
            HaltingAnalysis
        },
        metaInfo: {
            title: "Quorum monitor - Stellarbeat.io",
            meta: [
                {name: "description", content: "Inspect quorum set connections and metrics about network health"},
            ],
        },
    })
    export default class QuorumMonitor extends Vue {
        public network: Network = this.$root.$data.store.network;
        public isLoading: boolean = this.$root.$data.store.isLoading;

        protected searchString: string = "";
        protected centerNode: Node | null = null;
        protected selectedNode: Node | null = null;
        protected changeQueue: ChangeQueue = new ChangeQueue();
        protected newNodeName: string = "";
        protected showHaltingAnalysis: boolean = false;
        protected haltingAnalysisPublicKey: PublicKey | null = null;

        @Watch("$route")
        public on$routeChanged(to: any) {
            this.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
            if (to.query.center === "1") {
                this.centerNode = this.selectedNode;
            }
        }

        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.graph.networkTransitiveQuorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey));
        }

        public onNodeCenter(node: Node) {
            this.centerNode = node;
        }

        public toggleActive(node: Node) {
            this.processChange(new EntityPropertyUpdate(node, "active", !node.active));
        }

        public toggleValidating(node: Node) {
            if (!node.active)
                this.changeQueue.execute(new EntityPropertyUpdate(node, "active", !node.active));
            this.processChange(new EntityPropertyUpdate(node, "isValidating", !node.isValidating));
        }

        public updateValidatingStates(updates: Array<{ "publicKey": PublicKey, "validating": boolean }>) {
            updates.forEach(update => {
                let node = this.network.getNodeByPublicKey(update.publicKey);
                this.changeQueue.execute(new EntityPropertyUpdate(node, "isValidating", update.validating));
            });
            this.network.updateNetwork();
            (this.$refs.graph as any).restartSimulation();
        }

        onShowHaltingAnalysis(publicKey: PublicKey) {
            this.haltingAnalysisPublicKey = publicKey;
            this.showHaltingAnalysis = true;

            this.$nextTick(() => {
                this.$scrollTo("#halting-analysis-card");
            });
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
            if (quorumSet.threshold === newThreshold) {
                return;
            }

            this.processChange(new EntityPropertyUpdate(quorumSet, "threshold", newThreshold));
        }

        public deleteValidatorFromQuorumSet(quorumSet: QuorumSet, validator: Node) {
            this.processChange(new QuorumSetValidatorDelete(quorumSet, validator.publicKey));
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
            (this.$refs.graph as any).restartSimulation();
        }

        get latestCrawlDateString(): string {
            return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : "NA";
        }

        get isSimulation(): boolean {
            return this.changeQueue.hasUndo();
        }

        public undoUpdate() {
            if (!this.changeQueue.hasUndo()) {
                return;
            }
            this.changeQueue.undo();
            this.network.updateNetwork();
            if (this.selectedNode && !this.network.getNodeByPublicKey(this.selectedNode.publicKey)) {
                this.$router.push(
                    {
                        name: "quorum-monitor",
                        query: {"no-scroll": "1"}

                    },
                );
            }
            (this.$refs.graph as any).restartSimulation();
        }

        public redoUpdate() {
            if (!this.changeQueue.hasRedo()) {
                return;
            }
            this.changeQueue.redo();
            this.network.updateNetwork();
            (this.$refs.graph as any).restartSimulation();
        }

        public resetUpdates() {
            if (!this.changeQueue.hasUndo()) {
                return;
            }
            this.changeQueue.reset();
            this.network.updateNetwork();
            if (this.selectedNode && !this.network.getNodeByPublicKey(this.selectedNode.publicKey)) {
                this.$router.push(
                    {
                        name: "quorum-monitor",
                        query: {"no-scroll": "1"}
                    },
                );
            }
            (this.$refs.graph as any).restartSimulation();
        }

        public created() {

            // fix centering and selection in graph
            if (this.$route.params["publicKey"]) {
                this.selectedNode = this.network.getNodeByPublicKey(this.$route.params["publicKey"]);
            }
            if (!this.selectedNode) {
                this.$router.push(
                    {
                        name: "quorum-monitor"
                    },
                );
            }
            if (this.$route.query["center"] === "1" || this.$route.query["center"] === undefined) {
                this.centerNode = this.selectedNode;
            }
        }

        public simulateNewNode() {
            let node = new Node("localhost");
            node.name = this.newNodeName === "" ? "MyNewNode" : this.newNodeName;
            node.publicKey = this.makePublicKey();
            node.quorumSet.threshold = 1;
            node.active = true;
            node.isValidating = true;
            node.isValidator = true;
            this.$set(node, "x", 0); //doesn't belong here, needs better solution
            this.$set(node, "y", 0);
            this.changeQueue.execute(new NetworkAddNode(this.network, node));
            this.network.updateNetwork(this.network.nodes); //needs better solution
            (this.$refs.graph as any).restartSimulation();
            this.$router.push(
                {
                    name: "quorum-monitor-node",
                    params: {publicKey: node.publicKey},
                    query: {"center": "1", "no-scroll": "1"},
                },
            );
        }

        protected makePublicKey() {
            let result = "G";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let charactersLength = characters.length;
            for (let i = 0; i < 56; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        public beforeDestroy() {
            if (this.isSimulation) { // undo simulation
                this.changeQueue.reset();
                this.network.updateNetwork(this.network.nodes);
            } // todo: better way to manage network adjustments
        }
    }
</script>

<style scoped>
    .search-bar {
        display: flex;
    }

    .undo-redo {
        margin-right: 0px;
    }

    .graph-row {
        margin-bottom: 10px;
    }

    .pull-right {
        margin-left: auto;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-order: 100;
        order: 100;
        margin-right: -.5rem;
        -ms-flex-item-align: center;
        align-self: center;
    }
</style>