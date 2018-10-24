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
            <div class="header py-4 pl-4 pr-4">
                <div class="container-fluid">
                    <div class="d-flex">
                        <a class="header-brand" href="#">
                            <img src="logo.png" class="header-brand-img" alt="stellarbeat.io">
                            stellarbeat.io
                        </a>
                        <div class="d-flex order-lg-2 ml-auto">
                            <div class="nav-item d-none d-md-flex">
                                <a href="https://github.com/stellarbeat"
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
            <div class="header collapse d-lg-flex p-0 pl-4 pr-4" id="headerMenuCollapse">
                <div class="container-fluid">
                    <div class="row align-items-center">
                        <div class="col-lg order-lg-first">
                            <ul class="nav nav-tabs border-0 flex-column flex-lg-row">
                                <li class="nav-item">
                                     <router-link active-class="active" class="nav-link" :to="{ name: 'home'}"><i class="fe fe-home"></i>Home</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'nodes-table'}"><i class="fe fe-list"></i>Nodes</router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'quorum-monitor'}"><i class="fe fe-share-2"></i>Quorum Monitor (experimental)</router-link>
                                </li>
                                <!--li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'about'}"><i class="fe fe-info"></i>about</router-link>
                                </li!-->
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="my-3 my-md-5 pl-4 pr-4">
                <div class="container-fluid">

                <router-view>

                </router-view>
                </div>
            </div>
        </div>
    </div>


</template>

<script>
    const Home = require("./home.vue");
    const QuorumMonitor = require("./quorum-monitor.vue");
    const NodesTable = require("./nodes-table.vue");

    export default {
        components: {
            QuorumMonitor,
            Home,
            NodesTable
        },
        data() {
            return {
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