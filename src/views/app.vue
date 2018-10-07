<style>
    .red {
        color: #f00;
    }

    .graph-toolbar {
        justify-content: flex-end;
        float: right;
    }

    .row {
        margin-bottom: 10px;
    }

    .navbar {
        margin-bottom: 10px;
    }

</style>

<template>
    <div style="height: 100%;">
        <nav class="navbar navbar-dark bg-dark">
            <a class="navbar-brand" href="#">Quorum Monitor</a>
            <form class="form-inline">
                <search :nodes="this.network.nodes" v-on:node-selected="onNodeSelected" v-on:center-node="onNodeCenter"></search>
            </form>
        </nav>
        <div v-show="isSimulation" class="alert alert-warning" role="alert">
            You are viewing a simulation!
        </div>
        <Statistics :network="network"></Statistics>
        <div class="row">
            <div class="col-sm-8">
                <div class="card">
                    <div class="card-body" style="height: 100%">
                        <Graph ref="graph" :network="network" :selectedNode="selectedNode" v-on:center-node="onNodeCenter" :centerNode="centerNode"
                               v-on:node-selected="onNodeSelected"></Graph>
                        <GraphLegend></GraphLegend>
                    </div>
                </div>
            </div>
            <div class="col-sm-4">
                <div class="row">
                    <div class="col-sm-12">
                        <NodeExplorer :node="selectedNode" :network="network" v-on:node-toggle-active="toggleActive"></NodeExplorer>
                    </div>

                </div>
                <div v-show="isSimulation" class="row">
                    <div class="col-sm-12">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Simulated nodes</h5>
                                    <NodeList :nodes="simulatedNodes" :network="network" v-on:node-toggle-active="toggleActive"></NodeList>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!--div class="row">
            <NodeDetails v-show="centerNode" :node="centerNode.node"></NodeDetails>
        </div!-->

    </div>


</template>

<script>
    const Graph = require("./graph.vue");
    const GraphLegend = require("./graph-legend.vue");
    const NodeExplorer = require("./node/node-explorer.vue");
    const Search = require('./search.vue');
    const Statistics = require('./statistics.vue');
    const NodeList = require('./node-list.vue');


    export default {
        components: {
            NodeExplorer,
            NodeList,
            Graph,
            GraphLegend,
            Search,
            Statistics
        },
        data() {
            return {
                searchString: '',
                centerNode: null,
                selectedNode: null,
                simulatedNodes: []
            }
        },
        props: {
            network: {
                type: Object
            }
        },
        methods: {
            onNodeSelected: function (node) {
                this.selectedNode = node;
            },
            onNodeCenter: function (node) {
                this.centerNode = node;
            },
            toggleActive: function (node) {
                node.active = !node.active;

                if(this.simulatedNodes.includes(node)) {
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
    }
</script>