<template>
    <div id="app" class="page full">
        <div class="flex-fill">
            <div v-if="!isHeadlessRoute">

                <b-navbar toggle-breakpoint="lg" class="m-0 p-0" toggleable="lg">
                    <div class="header pt-2 pb-0 pl-4 pr-4 my-header">
                        <div polyfillclass="container-fluid">
                            <div class="d-flex">
                                <router-link class="header-brand mt-2"
                                             :to="{ name: 'network-dashboard', query: { view: $route.query.view}}">
                                    <img src="./assets/logo.png" class="header-brand-img" alt="stellarbeat.io">
                                </router-link>
                                <div class="d-flex flex-column ml-auto">
                                    <h2 class="brand-title mb-0">stellarbeat.io</h2>
                                    <h6 class="text-muted">stellar network visibility</h6>
                                </div>
                                <div class="d-flex ml-auto">
                                    <div class="nav-item d-none d-lg-flex">
                                        <a href="https://github.com/stellarbeat"
                                           class="btn btn-sm bt btn-outline-primary" target="_blank">
                                            <github/>
                                            Github</a>
                                        <a href="mailto:stellarbeatio@gmail.com"
                                           class="btn btn-sm bt btn-outline-primary ml-2" target="_blank">
                                            <b-icon-envelope/>
                                            Mail</a>
                                    </div>
                                </div>
                                <b-navbar-toggle class="my-navbar-toggle mb-2" target="nav_collapse"></b-navbar-toggle>
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
                                        <router-link active-class="active" class="nav-link"
                                                     :to="{
                                            name: 'network-dashboard'}"
                                        >
                                            <b-icon-house class="mr-1" scale="0.9"/>
                                            Home
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" exact-active-class="active" class="nav-link"
                                                     :to="{ name: 'nodes'}" exact>
                                            <b-icon-bullseye class="mr-1" scale="0.9"/>
                                            Nodes
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" class="nav-link"
                                                     :to="{ name: 'organizations'}" exact>
                                            <b-icon-building class="mr-1" scale="0.9"/>
                                            Organizations
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" class="nav-link" :to="{ name: 'api'}">
                                            <b-icon-code class="mr-1" scale="0.9"/>
                                            API
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" class="nav-link" :to="{ name: 'faq'}">
                                            <b-icon-question-circle class="mr-1" scale="0.9"/>
                                            FAQ
                                        </router-link>
                                    </li>
                                </ul>

                            </div>
                            <div class="col-lg-3 ml-auto">
                                <form class="input-icon my-3 my-lg-0">
                                    <search v-if="!store.isLoading"/>
                                </form>
                            </div>


                        </div>
                    </div>

                </b-collapse>
            </div>

            <div class="mt-0 mt-md-2 pl-4 pr-4">
                <div class="container-fluid">
                    <b-alert :show="showError" variant="danger">{{errorMessage}}</b-alert>
                    <div v-if="store.isLoading" class="d-flex justify-content-center mt-5">
                        <div class="loader"></div>
                    </div>
                    <div v-else>
                        <router-view v-if="!store.isLoading || isFullPreRenderRoute"
                                     :network="network"
                                     :isLoading="store.isLoading"
                        />

                    </div>
                </div>
            </div>
        </div>
        <footer class="footer">
            <div class="pl-4 pr-6 container-fluid">
                <div class="row align-items-center flex-row-reverse">
                    <div class="col-auto ml-lg-auto">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <ul class="list-inline list-inline-dots mb-0">
                                    <li class="list-inline-item">
                                        <router-link active-class="active" class="nav-link"
                                                     :to="{ name: 'terms-and-conditions'}" exact> Terms and Conditions
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
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import CrawlTime from '@/components/crawl-time.vue';
    import Search from '@/components/node/search.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import Github from '@/components/organization/logo/github.vue';
    import {
        BNavbar,
        BAlert,
        BCollapse,
        BIconBuilding,
        BIconBullseye,
        BIconHouse,
        BIconCode,
        BIconQuestionCircle,
        BIconEnvelope,
        BNavbarToggle
    } from 'bootstrap-vue';

    @Component({
        name: 'app',
        components: {
            Github,
            UndoRedo,
            Search,
            CrawlTime,
            BNavbar,
            BAlert,
            BCollapse,
            BIconBuilding,
            BIconBullseye,
            BIconHouse,
            BIconCode,
            BIconQuestionCircle,
            BIconEnvelope,
            BNavbarToggle
        },
        metaInfo: {
            title: 'Stellarbeat.io - Stellar network visibility',
            meta: [
                {
                    name: 'description',
                    content: 'Giving insight into the Stellar public network through various tools & visualizations.'
                }
            ]
        }
    })

    export default class App extends Vue {
        protected errorMessage = 'Could not connect to stellarbeat.io api';

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

        get isFullPreRenderRoute() {
            return this.$router.currentRoute.meta.fullPreRender;
        }

        get isHeadlessRoute() {
            return this.$router.currentRoute.meta.isHeadlessRoute;
        }
    }
</script>

<style scoped>
    .action-bar {
        background-color: #eaebed;
        padding: 2px;
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