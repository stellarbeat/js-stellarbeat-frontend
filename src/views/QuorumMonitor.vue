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
            <div v-show="changeQueue.hasUndo()" class="alert alert-warning" role="alert">
                You are viewing a simulation!
            </div>
            <div class="page-header  mt-2">
                <h1 class="page-title">
                    Quorum Monitor
                </h1>
                <div class="page-subtitle">Latest crawl on {{latestCrawlDateString}}</div>
            </div>
            <Statistics :network="network"></Statistics>
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Quorum set explorer</h3>

                            <div class="pull-right">
                                <UndoRedo v-if="selectedNode && (changeQueue.hasRedo() || changeQueue.hasUndo())"
                                          :redoUpdate="redoUpdate" :resetUpdates="resetUpdates"
                                          :undoUpdate="undoUpdate"
                                          :hasUndo="changeQueue.hasUndo()"
                                          :hasRedo="changeQueue.hasRedo()"
                                          class="undo-redo"/>
                                <search :nodes="this.network.nodes"
                                        v-on:center-node="onNodeCenter"></search>
                            </div>
                        </div>
                        <div class="card-body" style="height: 100%">
                            <div class="row">
                                <div class="col-12 col-xl-8 graph-row">
                                    <Graph ref="graph" :network="network"
                                           v-on:center-node="onNodeCenter"
                                           :centerNode="centerNode"
                                           :selectedNode="selectedNode"
                                    ></Graph>
                                    <div class="text-right pt-1">
                                        <GraphLegend></GraphLegend>
                                    </div>
                                </div>
                                <div class="col-12 col-xl-4">
                                    <div class="row">
                                        <div class="col-12">
                                            <router-view v-on:node-toggle-active="toggleActive"
                                                         v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                                                         v-on:quorumset-delete-validator="deleteValidatorFromQuorumSet"
                                                         v-on:quorumset-delete-inner-quorumset="deleteInnerQuorumSet"
                                                         v-on:quorumset-add-inner-quorumset="addInnerQuorumSet"
                                                         v-on:center-node="onNodeCenter"
                                                         :network="network"
                                                         :selectedNode="selectedNode"
                                            >
                                            </router-view>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row row-cards">
                <div class="col-12 col-md-6">

                    <div class="card mb-2">
                        <div class="card-header">
                            Manual
                        </div>
                        <div class="card-body">
                            <Manual></Manual>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6">
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
                            <!--b-row class="mt-2">
                                <b-col-12>
                                    <b-button v-b-modal.add-node-modal variant="primary">Add new node (simulation)</b-button>
                                </b-col-12>
                                <b-modal id="add-node-modal" title="Simulate a new node">
                                    <p class="my-4">Hello from modal!</p>
                                </b-modal>
                            </b-row!-->
                        </div>
                    </div>
                </div>
            </div>
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

    import {Node, Network, QuorumSet} from "@stellarbeat/js-stellar-domain";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import {Change, ChangeQueue} from "@/services/change-queue/change-queue";
    import {EntityPropertyUpdate} from "@/services/change-queue/changes/entity-property-update";
    import UndoRedo from "@/components/quorum-monitor/UndoRedo.vue";
    import {QuorumSetValidatorDelete} from "@/services/change-queue/changes/quorum-set-validator-delete";
    import {InnerQuorumSetDelete} from "@/services/change-queue/changes/inner-quorum-set-delete";
    import {InnerQuorumSetAdd} from "@/services/change-queue/changes/inner-quorum-set-add";

    @Component({
        name: "quorum-monitor",
        components: {
            UndoRedo,
            QuorumSetExplorer,
            Graph,
            GraphLegend,
            Search,
            Statistics,
            Manual
        },
        metaInfo: {
            title: "Quorum monitor - Stellarbeat.io",
            meta: [
                {name: "description", content: "Inspect quorum set connections and metrics about network health"},
            ],
        },
    })
    export default class QuorumMonitor extends Vue {
        public searchString: string = "";
        public centerNode: Node | null = null;
        public selectedNode: Node | null = null;
        public simulatedNodes: Node[] = [];
        public optionNodeActiveBasedOnLatestCrawl: boolean = false;
        public changeQueue: ChangeQueue = new ChangeQueue();

        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        @Watch("optionNodeActiveBasedOnLatestCrawl")
        public onOptionNodeActiveBasedOnLatestCrawlChanged(activeInLastCrawl: boolean) {
            if (activeInLastCrawl) {
                this.network.nodes.forEach(
                    (node) => node.active = node.statistics.activeInLastCrawl,
                );
            }
            if (!activeInLastCrawl) {
                this.network.nodes.forEach(
                    (node) => node.statistics.activeCounter > 0 ? node.active = true : node.active = false,
                );
            }

            this.network.updateNetwork(this.network.nodes);
            (this.$refs.graph as any).restartSimulation();
        }

        @Watch("$route")
        public on$routeChanged(to: any) {
            this.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
            if (to.query.center === "1") {
                this.centerNode = this.selectedNode;
            }
        }

        public onNodeCenter(node: Node) {
            this.centerNode = node;
        }

        public toggleActive(node: Node) {
            this.processChange(new EntityPropertyUpdate(node, "active", !node.active));
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
            if (quorumSet.threshold === newThreshold) {
                return;
            }

            this.processChange(new EntityPropertyUpdate(quorumSet, "threshold", newThreshold));
        }

        public deleteValidatorFromQuorumSet(quorumSet:QuorumSet, validator:Node) {
            this.processChange(new QuorumSetValidatorDelete(quorumSet, validator.publicKey));
        }

        public deleteInnerQuorumSet(quorumSet:QuorumSet, fromQuorumSet:QuorumSet){
            this.processChange(new InnerQuorumSetDelete(fromQuorumSet, quorumSet));
        }

        public addInnerQuorumSet(toQuorumSet:QuorumSet){
            this.processChange(new InnerQuorumSetAdd(toQuorumSet));
        }

        protected processChange(change:Change) {
            this.changeQueue.execute(change);
            this.network.updateNetwork();
            (this.$refs.graph as any).restartSimulation();
        }

        get latestCrawlDateString(): string {
            return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : "NA";
        }

        get isSimulation(): boolean {
            return this.simulatedNodes.length > 0;
        }

        public undoUpdate() {
            if (!this.changeQueue.hasUndo()) {
                return;
            }
            this.changeQueue.undo();
            this.network.updateNetwork();
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
            (this.$refs.graph as any).restartSimulation();
        }

        public created() {
            // fix centering and selection in graph
            if (this.$route.params["publicKey"]) {
                this.selectedNode = this.network.getNodeByPublicKey(this.$route.params["publicKey"]);
            }
            if (this.$route.query["center"] === "1" || this.$route.query["center"] === undefined) {
                this.centerNode = this.selectedNode;
            }
        }

        public beforeDestroy() {
            if (this.isSimulation || this.optionNodeActiveBasedOnLatestCrawl) { // undo simulation
                this.simulatedNodes.forEach((node) => node.active = !node.active);
                if (this.optionNodeActiveBasedOnLatestCrawl) {
                    this.network.nodes.forEach(
                        (node) => node.statistics.activeCounter > 0 ? node.active = true : node.active = false,
                    );
                }
                this.network.updateNetwork(this.network.nodes);
            } // todo: better way to manage network adjustments
        }
    }
</script>

<style scoped>
    .undo-redo {
        margin-right: 10px;
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