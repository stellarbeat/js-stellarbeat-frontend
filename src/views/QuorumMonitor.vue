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
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>

        </div>
        <div v-else>
            <div v-show="isSimulation" class="alert alert-warning" role="alert">
                You are viewing a simulation!
            </div>
            <div class="page-header">
                <h1 class="page-title">
                    Quorum Monitor
                </h1>
                <div class="page-subtitle">Latest crawl on {{lastCrawlDateString}}</div>
            </div>
            <Statistics :network="network"></Statistics>
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Quorum set explorer</h3>
                            <div class="pull-right">
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
                                                         v-on:center-node="onNodeCenter"
                                                         :network="network"
                                                         :selectedNode="selectedNode"
                                            >
                                            </router-view>
                                        </div>

                                    </div>
                                    <div v-show="isSimulation" class="row pt-3">
                                        <div class="col-sm-12">
                                            <h4>Nodes modified by user</h4>
                                            <NodeList :nodes="simulatedNodes" :network="network"
                                                      v-on:node-toggle-active="toggleActive"></NodeList>
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
                    <b-card header="Manual"
                            tag="article"
                            style=""
                            class="mb-2">
                        <Manual></Manual>
                    </b-card>
                </div>
                <div class="col-12 col-md-6">
                    <b-card header="Options"
                            tag="article"
                            style=""
                            class="mb-2">
                        <label class="custom-switch">
                            <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                                   v-model="optionNodeActiveBasedOnLatestCrawl">
                            <span class="custom-switch-indicator"></span>
                            <span class="custom-switch-description">Use latest crawl results for active status of nodes</span>
                        </label>
                    </b-card>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Graph from "../components/quorum-monitor/graph/graph.vue";
    import GraphLegend from "../components/quorum-monitor/graph/graph-legend.vue";
    import QuorumSetExplorer from "../components/quorum-monitor/quorum-set-explorer/quorum-set-explorer.vue";
    import Search from '../components/quorum-monitor/search.vue';
    import Statistics from '../components/statistics.vue';
    import NodeList from '../components/quorum-monitor/quorum-set-explorer/node-list.vue';
    import Manual from '../components/quorum-monitor/manual.vue';

    export default {
        name: "quorum-monitor",
        components: {
            QuorumSetExplorer,
            NodeList,
            Graph,
            GraphLegend,
            Search,
            Statistics,
            Manual
        },
        data() {
            return {
                searchString: '',
                centerNode: null,
                selectedNode: null,
                simulatedNodes: [],
                optionNodeActiveBasedOnLatestCrawl: false
            }
        },
        props: {
            network: {
                type: Object
            },
            isLoading: {
                type: Boolean
            }
        },
        watch: {
            optionNodeActiveBasedOnLatestCrawl: function (val) {
                //Use your source of truth to trigger events!
                if (val === true) {
                    this.network.nodes.forEach(
                        node => node.active = node.statistics.activeInLastCrawl
                    )
                }
                if (val === false) {
                    this.network.nodes.forEach(
                        node => node.statistics.activeCounter > 0 ? node.active = true : node.active = false
                    )
                }

                this.network.updateNetwork();
                this.$refs.graph.restartSimulation();
            },
            '$route'(to, from) {
                this.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
                if (to.query.center) {
                    this.centerNode = this.selectedNode;
                }
            }
        },
        methods: {
            onNodeCenter: function (node) {
                this.centerNode = node;
            },
            toggleActive: function (node) { //todo move to app
                node.active = !node.active;

                if (this.simulatedNodes.includes(node)) {
                    this.simulatedNodes = this.simulatedNodes.filter(simNode => node !== simNode);
                } else {
                    this.simulatedNodes.push(node);
                }

                this.network.updateNetwork();
                this.$refs.graph.restartSimulation();
            }
        },
        computed: {
            lastCrawlDateString: function () {
                return this.network.getLatestCrawlDate() ? this.network.getLatestCrawlDate().toLocaleString() : 'NA';
            },
            isSimulation: function () {
                return this.simulatedNodes.length > 0;
            }
        },
        created() {
            //fix centering and selection in graph
            let publicKey = this.$route.params.publicKey;
            if (this.$route.params.publicKey) {
                this.selectedNode = this.network.getNodeByPublicKey(this.$route.params.publicKey);
            }
            if (this.$route.query.center) {
                this.centerNode = this.selectedNode;
            }
        },
        beforeDestroy: function () {
            if (this.isSimulation || this.optionNodeActiveBasedOnLatestCrawl) { //undo simulation
                this.simulatedNodes.forEach(node => node.active = !node.active);
                if (this.optionNodeActiveBasedOnLatestCrawl) {
                    this.network.nodes.forEach(
                        node => node.statistics.activeCounter > 0 ? node.active = true : node.active = false
                    )
                }
                this.network.updateNetwork();
            } //todo: better way to manage network adjustments
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