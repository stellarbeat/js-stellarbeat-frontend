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

        <div class="page-header  mt-2">
            <h1 class="page-title">
                Quorum Monitor
                <b-badge v-show="store.isSimulation" variant="warning">Simulation</b-badge>
            </h1>
            <crawl-time></crawl-time>
        </div>
        <Statistics
                :network="network"
        ></Statistics>
        <div class="row">
            <div class="col-12">
                <search-card></search-card>
            </div>
        </div>
        <div class="">
            <div class="row">
                <div class="col-sm-12 col-lg-8">
                    <div class="row">
                        <div class="col-12">
                            <NetworkGraphCard id="quorum-set-explorer-card"></NetworkGraphCard>
                        </div>
                        <div class="col-12">

                        </div>
                    </div>

                </div>
                <div class="col-lg-4 col-sm-12 order-0">
                    <div class="row">
                        <div class="col-12">
                            <quorum-set-explorer-card v-if="selectedNode"
                                                      v-on:show-halting-analysis="onShowHaltingAnalysis"
                            ></quorum-set-explorer-card>
                            <div class="card" v-else>
                                <div class="card-header">
                                    <div class="card-title">Network transitive quorumset</div>
                                </div>
                                <div class="card-body py-2 px-0">
                                    <node-list :network="network" :nodes="networkTransitiveQuorumSetNodes"
                                               :render-title="false"
                                    />
                                </div>
                                <div class="card-footer p-3">
                                    <simulate-new-node class="col-12 pl-0"></simulate-new-node>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row" v-if="selectedNode">
                        <div class="col-12">
                            <statistics-card></statistics-card>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row" v-if="showHaltingAnalysis" id="halting-analysis-card">
                <div class="col-12">
                    <HaltingAnalysis
                            :network="network"
                            :publicKey="haltingAnalysisPublicKey"
                            v-on:update-validating-states="updateValidatingStates">
                    </HaltingAnalysis>
                </div>
            </div>
            <div class="row">
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
    import HaltingAnalysis from "@/components/quorum-monitor/halting-analysis/halting-analysis.vue";

    import {Node, Network, QuorumSet, PublicKey} from "@stellarbeat/js-stellar-domain";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import UndoRedo from "@/components/quorum-monitor/UndoRedo.vue";
    import FullValidatorTitle from "@/components/node/full-validator-title.vue";
    import NodeList from "@/components/quorum-monitor/quorum-set-explorer/node-list.vue";
    import Store from "@/Store";
    import SearchCard from "@/components/quorum-monitor/cards/search-card.vue";
    import NetworkGraphCard from "@/components/quorum-monitor/cards/network-graph-card.vue";
    import QuorumSetExplorerCard from "@/components/quorum-monitor/cards/quorum-set-explorer-card.vue";
    import ValidatingHistoryCard from "@/components/quorum-monitor/cards/validating-history-card.vue";
    import SimulateNewNode from '@/components/quorum-monitor/quorum-set-explorer/simulate-new-node.vue';
    import CrawlTime from '@/components/crawl-time.vue';

    @Component({
        name: "quorum-monitor",
        components: {
            SimulateNewNode,
            StatisticsCard: ValidatingHistoryCard,
            QuorumSetExplorerCard,
            NetworkGraphCard,
            SearchCard,
            NodeList,
            FullValidatorTitle,
            UndoRedo,
            QuorumSetExplorer,
            Graph,
            GraphLegend,
            Search,
            Statistics,
            Manual,
            HaltingAnalysis,
            CrawlTime
        },
        metaInfo: {
            title: "Quorum monitor - Stellarbeat.io",
            meta: [
                {name: "description", content: "Inspect quorum set connections and metrics about network health"},
            ],
        },
    })
    export default class QuorumMonitor extends Vue {
        protected newNodeName: string = "";
        protected showHaltingAnalysis: boolean = false;
        protected haltingAnalysisPublicKey: PublicKey | null = null;

        @Watch("$route")
        public on$routeChanged(to: any) {
            this.store.quorumMonitorStore.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
            if (to.query.center === "1") {
                this.store.quorumMonitorStore.centerNode = this.store.quorumMonitorStore.selectedNode;
            }
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get centerNode() {
            return this.store.quorumMonitorStore.centerNode;
        }

        get network() {
            return this.$root.$data.store.network;
        }

        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.graph.networkTransitiveQuorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey));
        }

        public onNodeCenter(node: Node) {
            this.store.quorumMonitorStore.centerNode = node;
        }

        onShowHaltingAnalysis(publicKey: PublicKey) {
            this.haltingAnalysisPublicKey = publicKey;
            this.showHaltingAnalysis = true;

            this.$nextTick(() => {
                this.$scrollTo("#halting-analysis-card");
            });
        }

        get latestCrawlDateString(): string {
            return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : "NA";
        }

        public updateValidatingStates(updates: Array<{ "publicKey": PublicKey, "validating": boolean }>) {
            this.store.updateValidatingStates(updates);
        }

        get isSimulation(): boolean {
            return this.store.isSimulation;
        }

        public created() {
            // fix centering and selection in graph
            if (this.$route.params["publicKey"]) {
                this.store.quorumMonitorStore.selectedNode = this.network.getNodeByPublicKey(this.$route.params["publicKey"]);
            }
            if (!this.selectedNode) {
                this.$router.push(
                    {
                        name: "quorum-monitor"
                    },
                );
            }
            if (this.$route.query["center"] === "1" || this.$route.query["center"] === undefined) {
                this.store.quorumMonitorStore.centerNode = this.selectedNode;
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
            this.store.addNodeToNetwork(node);
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
                this.store.resetUpdates();
            } // todo: better way to manage network adjustments
        }
    }
</script>

<style scoped>
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