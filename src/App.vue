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
    <div id="app" class="page">
        <div class="page-main">
            <div class="header py-4 pl-4 pr-4">
                <div class="container-fluid">
                    <div class="d-flex">
                        <a class="header-brand" href="#">
                            <img src="./assets/logo.png" class="header-brand-img" alt="stellarbeat.io">
                            stellarbeat.io
                        </a>
                        <div class="d-flex order-lg-2 ml-auto">
                            <div class="nav-item d-none d-md-flex">
                                <a href="https://github.com/stellarbeat"
                                   class="btn btn-sm bt btn-outline-primary" target="_blank"><i
                                        class="fe fe-github"></i> Github</a>
                                <a href="mailto:stellarbeatio@gmail.com"
                                   class="btn btn-sm bt btn-outline-primary ml-2" target="_blank"><i
                                        class="fe fe-mail"></i> Mail</a>
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
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'home'}" exact><i
                                            class="fe fe-home"></i>Home
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'nodes'}"><i
                                            class="fe fe-list"></i>Nodes
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'quorum-monitor'}">
                                        <i class="fe fe-target"></i>Quorum Monitor (experimental)
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'api'}">
                                        <i class="fe fe-share-2"></i>API
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'about'}"><i class="fe fe-info"></i>about</router-link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="my-3 my-md-5 pl-4 pr-4">
                <div class="container-fluid">
                    <div v-if="isLoading" class="row">
                        <div class="col-5"></div>
                        <div class="col-2 loader"></div>
                        <div class="col-5"></div>

                    </div>
                    <router-view v-if="!isLoading" :network="network" :isLoading="isLoading">

                    </router-view>
                </div>
            </div>
        </div>
    </div>


</template>

<script>
    const Network = require('@stellarbeat/js-stellar-domain').Network;
    const Node = require('@stellarbeat/js-stellar-domain').Node;
    const axios = require('axios');

    export default {
        data() {
            return {
                network: {},
                isLoading: true
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
            },
            fetchData: function () {
                return axios.get('https://stellarbeat-backend-staging.herokuapp.com/api/v1/nodes');
            }
        },
        computed: {
            isSimulation: function () {
                return this.simulatedNodes.length > 0;
            }
        },
        async created() {
            let data = await this.fetchData();
            let nodesRaw = data.data;
            let nodes = nodesRaw.map(node => Node.fromJSON(node));

            this.network = new Network(nodes);
            this.isLoading = false;
        }
    }
</script>

<style scoped>

</style>