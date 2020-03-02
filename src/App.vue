<template>
    <div id="app" class="page" :class="backgroundClass">
        <div class="flex-fill">
            <div v-if="!isHeadlessRoute">

            <b-navbar toggle-breakpoint="lg" class="m-0 p-0" toggleable="lg">
                <div class="header pt-2 pb-0 pl-4 pr-4 my-header">
                    <div polyfillclass="container-fluid">
                        <div class="d-flex">
                            <router-link class="header-brand mt-2" :to="{ name: 'network'}" exact>
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
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'network'}" exact><i
                                            class="fe fe-activity"></i>Network
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'nodes'}"><i
                                            class="fe fe-list"></i>Nodes
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'organizations'}"><i
                                            class="fe fe-globe"></i>Organizations
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'api'}">
                                        <i class="fe fe-share-2"></i>API
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link active-class="active" class="nav-link" :to="{ name: 'faq'}"><i
                                            class="fe fe-help-circle"></i>FAQ
                                    </router-link>
                                </li>
                            </ul>
                            <!--crawl-time></crawl-time!-->

                        </div>
                    </div>
                </div>

            </b-collapse>
            </div>

            <div v-if="!isHeadlessRoute" class="my-0 my-md-5 pl-4 pr-4">
                <div class="container-fluid">
                    <div class="my-3 my-md-5">
                        <b-alert :show="showError" variant="danger">{{errorMessage}}</b-alert>
                        <div v-if="store.isLoading && !isFullPreRenderRoute" class="row">
                            <div class="col-5"></div>
                            <div class="col-2 loader"></div>
                            <div class="col-5"></div>

                        </div>
                        <router-view v-if="!store.isLoading || isFullPreRenderRoute"
                                     :network="network"
                                     :isLoading="store.isLoading"
                        >
                        </router-view>
                    </div>

                </div>
            </div>
            <div v-else>
                <router-view :network="network" :isLoading="store.isLoading">
                </router-view>
            </div>

        </div>
        <footer v-if="!isHeadlessRoute" class="footer">
            <div class="pl-4 pr-6 container-fluid">
                <div class="row align-items-center flex-row-reverse">
                    <div class="col-auto ml-lg-auto">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <ul class="list-inline list-inline-dots mb-0">
                                    <li class="list-inline-item">
                                        <router-link active-class="active" class="nav-link" :to="{ name: 'terms-and-conditions'}" exact> Terms and Conditions
                                        </router-link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>


</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";
    import CrawlTime from '@/components/crawl-time.vue';

    @Component({
        name: "app",
        components: {CrawlTime},
        metaInfo: {
            title: "Stellarbeat.io - Stellar network visibility",
            meta: [
                {
                    name: "description",
                    content: "Giving insight into the Stellar public network through various tools & visualizations."
                }
            ]
        }
    })

    export default class App extends Vue {
        protected errorMessage = "Could not connect to stellarbeat.io api";

        async created() {
            await this.store.fetchData();
            this.store.isLoading = false;
        }

        get store() {
            return this.$root.$data.store;
        }
        get network() {
            return this.store.network;
        }

        get showError() {
            return this.store.fetchingNodeDataFailed;
        }

        get backgroundClass() {
            return {
                'headless': this.isHeadlessRoute,
                'full': !this.isHeadlessRoute
            }
        }

        get isFullPreRenderRoute() {
            return this.$router.currentRoute.meta.fullPreRender;
        }

        get isHeadlessRoute() {
            return this.$router.currentRoute.meta.isHeadlessRoute;
        }
    }
</script>

<style scoped>
    .headless {
        background: #FBFAF7;
    }
    .full {
        background: #f5f7fb;
    }
    .brand-title {
        color: #08b5e5;
    }

    .collapser {
        background: white;
    }

    .my-header {
        width: 100%;
    }

    .my-navbar-toggle {
        border: none;

    }

</style>