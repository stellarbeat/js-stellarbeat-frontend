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
            <b-navbar toggle-breakpoint="lg" class="m-0 p-0" toggleable="md">
                <div class="header pt-2 pb-0 pl-4 pr-4 my-header">
                    <div class="container-fluid">
                        <div class="d-flex">
                            <router-link class="header-brand mt-2" :to="{ name: 'home'}" exact>
                                <img src="./assets/logo.png" class="header-brand-img" alt="stellarbeat.io">
                            </router-link>
                            <div class="d-flex flex-column ml-auto">
                                <h2 class="brand-title mb-0">stellarbeat.io</h2>
                                <h6 class="text-muted">stellar network visibility</h6>
                            </div>
                            <div class="d-flex ml-auto">
                                <div class="nav-item d-none d-lg-flex">
                                    <a href="https://github.com/stellarbeat"
                                       class="btn btn-sm bt btn-outline-primary" target="_blank"><i
                                            class="fe fe-github"></i> Github</a>
                                    <a href="mailto:stellarbeatio@gmail.com"
                                       class="btn btn-sm bt btn-outline-primary ml-2" target="_blank"><i
                                            class="fe fe-mail"></i> Mail</a>
                                </div>
                            </div>
                            <b-navbar-toggle class="my-navbar-toggle mb-2" target="nav_collapse"></b-navbar-toggle>

                            <!--a href="#" class="header-toggler d-lg-none ml-3 ml-lg-0" data-toggle="collapse"
                               data-target="#headerMenuCollapse">
                                <span class="header-toggler-icon"></span>
                            </a!-->
                        </div>
                    </div>
                </div>

            </b-navbar>
            <b-collapse class="header collapse d-lg-flex p-0 pl-4 pr-4" is-nav id="nav_collapse">
                <div class="container-fluid collapser">
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

            </b-collapse>
            <div class="my-0 my-md-5 pl-4 pr-4">
                <div class="container-fluid">
                    <div class="my-3 my-md-5">
                        <b-alert :show="showError" variant="danger">{{errorMessage}}</b-alert>
                        <div v-if="isLoading && !isFullPreRenderRoute" class="row">
                            <div class="col-5"></div>
                            <div class="col-2 loader"></div>
                            <div class="col-5"></div>

                    </div>
                    <router-view v-if="!isLoading || isFullPreRenderRoute" :network="network" :isLoading="isLoading">

                        </router-view>
                    </div>

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
                isLoading: true,
                showError: false,
                errorMessage: ""
            }
        },
        methods: {
            fetchData: async function () {
                try {
                    let result = await axios.get(process.env.VUE_APP_NODES_API_URL);
                    return result.data;
                } catch (error) { //todo logging
                    console.log(error);
                    this.showError = true;
                    this.errorMessage = "Could not connect to api";
                    return [];
                }

            }
        },
        computed: {
            isSimulation: function () {
                return this.simulatedNodes.length > 0;
            },
            isFullPreRenderRoute: function () {
                return this.$router.currentRoute.meta.fullPreRender;
            }
        },
        async created() {
            let nodesRaw = await this.fetchData();
            let nodes = nodesRaw.map(node => Node.fromJSON(node));

            this.network = new Network(nodes);
            this.isLoading = false;
        }
    }
</script>

<style scoped>
    .brand-title{
        color: #08b5e5;
    }

    .collapser {
        background: white;
    }

    .my-header{
        width: 100%;
    }
    .my-navbar-toggle{
        border: none;

    }

</style>