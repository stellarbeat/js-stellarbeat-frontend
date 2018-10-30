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
                <div class="page-subtitle">Last crawl on TODO UTC</div>
            </div>
            <Statistics :network="network"></Statistics>
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body" style="height: 100%">
                            <div class="row">
                                <div class="col-12">
                                    <search :nodes="this.network.nodes" v-on:node-selected="onNodeSelected"
                                            v-on:center-node="onNodeCenter"></search>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 col-lg-8 graph-row">
                                    <Graph ref="graph" :network="network" v-on:center-node="onNodeCenter"
                                           :centerNode="centerNode"
                                           v-on:node-selected="onNodeSelected"></Graph>
                                    <GraphLegend></GraphLegend>

                                </div>
                                <div class="col-12 col-lg-4">
                                    <div class="row">
                                        <div class="col-12">
                                            <router-view v-on:node-toggle-active="toggleActive"
                                                         v-on:center-node="onNodeCenter"
                                                         v-on:node-selected="onNodeSelected"
                                                         :network="network">
                                            </router-view>
                                        </div>

                                    </div>
                                    <div v-show="isSimulation" class="row">
                                        <div class="col-sm-12">
                                            <div class="card">
                                                <div class="card-body">
                                                    <h5 class="card-title">Simulated nodes</h5>
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
                            <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox" v-model="optionNodeActiveBasedOnLatestCrawl">
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
    import Graph from "../components/graph.vue";
    import GraphLegend from "../components/graph-legend.vue";
    import NodeExplorer from "../components/node/node-explorer.vue";
    import Search from '../components/search.vue';
    import Statistics from '../components/statistics.vue';
    import NodeList from '../components/node-list.vue';
    import Manual from '../components/manual.vue';

    export default {
        name: "quorum-monitor",
        components: {
            NodeExplorer,
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
            optionNodeActiveBasedOnLatestCrawl: function(val){
                //Use your source of truth to trigger events!
                if(val === true) {
                    this.network.nodes.forEach(
                        node => node.active = node.statistics.activeInLastCrawl
                    )
                }
                if(val === false) {
                    this.network.nodes.forEach(
                        node => node.statistics.activeCounter > 0 ? node.active = true: node.active = false
                    )
                }

                this.network.updateNetwork();
                this.$refs.graph.restartSimulation();
            }
        },
        methods: {
            onNodeSelected: function (node) {
                this.$router.push({name: 'quorum-monitor-node', params: {publicKey: node.publicKey}});
            },
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
            isSimulation: function () {
                return this.simulatedNodes.length > 0;
            }
        },
        created() {
            //this.selectedNode = this.network.nodes.find(node => node.displayName === 'SDF validator 1');
        },
        /*mounted() {
            $(function () {
                $('[data-toggle="tooltip"]').tooltip(); //todo performance?
            });
        }*/
        beforeDestroy: function () {
            if(this.isSimulation || this.optionNodeActiveBasedOnLatestCrawl) { //undo simulation
                this.simulatedNodes.forEach(node => node.active = !node.active);
                if(this.optionNodeActiveBasedOnLatestCrawl) {
                    this.network.nodes.forEach(
                        node => node.statistics.activeCounter > 0 ? node.active = true: node.active = false
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
</style>