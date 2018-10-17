<style>
    .red {
        color: #f00;
    }

    .graph-toolbar {
        justify-content: flex-end;
        float: right;
    }

</style>

<template>
    <div class="page">
        <div class="page-main">
            <div class="header py-4">
                <div class="container-fluid">
                    <div class="d-flex">
                        <a class="header-brand" href="#">
                            <img src="logo.png" class="header-brand-img" alt="stellarbeat.io">
                            stellarbeat.io
                        </a>
                        <div class="d-flex order-lg-2 ml-auto">
                            <div class="nav-item d-none d-md-flex">
                                <a href="https://github.com/stellarbeat/quorum-monitor"
                                   class="btn btn-sm btn-outline-primary" target="_blank">Github</a>
                            </div>
                        </div>
                        <a href="#" class="header-toggler d-lg-none ml-3 ml-lg-0" data-toggle="collapse"
                           data-target="#headerMenuCollapse">
                            <span class="header-toggler-icon"></span>
                        </a>
                    </div>
                </div>
            </div>
            <div class="header collapse d-lg-flex p-0" id="headerMenuCollapse">
                <div class="container-fluid">
                    <div class="row align-items-center">
                        <div class="col-lg order-lg-first">
                            <ul class="nav nav-tabs border-0 flex-column flex-lg-row">
                                <li class="nav-item">
                                    <a href="#" class="nav-link active"><i class="fe fe-home"></i> Quorum Monitor</a>
                                </li>
                                <li class="nav-item">
                                    <a href="#" class="nav-link" data-toggle="dropdown"><i class="fe fe-info"></i> About</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <!--search :nodes="this.network.nodes" v-on:node-selected="onNodeSelected"
                    v-on:center-node="onNodeCenter"></search!-->
            <div class="my-3 my-md-5">
                <!--div class="page-header">
                    <h1 class="page-title">
                        stellar network visibility
                    </h1>
                </div!-->
                <div v-show="isSimulation" class="alert alert-warning" role="alert">
                    You are viewing a simulation!
                </div>
                <Statistics :network="network"></Statistics>
                <div class="row row-cards">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body" style="height: 100%">

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
                                                <search :nodes="this.network.nodes" v-on:node-selected="onNodeSelected"
                                                        v-on:center-node="onNodeCenter"></search>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-12">
                                                <router-view v-on:node-toggle-active="toggleActive"
                                                             v-on:center-node="onNodeCenter"
                                                             v-on:node-selected="onNodeSelected"></router-view>
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

                <!--div class="row">
                    <NodeDetails v-show="centerNode" :node="centerNode.node"></NodeDetails>
                </div!-->
            </div>
        </div>
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
                this.$router.push({name: 'node', params: {publicKey: node.publicKey}});
            },
            onNodeCenter: function (node) {
                this.centerNode = node;
            },
            toggleActive: function (node) {
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
    }
</script>

<style scoped>
.graph-row{
    margin-bottom: 10px;
}
</style>