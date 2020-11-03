<template>
    <div id="app" class="page full">
        <div class="flex-fill">
            <div>
                <b-navbar toggle-breakpoint="lg" class="m-0 p-0" toggleable="lg">
                    <div class="header pt-2 pb-0 my-header">
                        <div class="container">
                            <div class="d-flex justify-content-between w-100">
                                <div class="d-flex">
                                    <router-link class="header-brand mr-0 mt-2"
                                                 :to="{ name: 'network-dashboard', query: { view: $route.query.view, network: $route.query.network} }">
                                        <img src="./assets/logo.png" class="header-brand-img" alt="stellarbeat.io">
                                    </router-link>
                                    <div class="d-none d-lg-flex" style="width: 264px"></div>
                                </div>
                                <div class="d-flex flex-column mr-0">
                                    <h2 class="brand-title mb-0">stellarbeat.io</h2>
                                    <h6 class="text-muted">stellar network visibility</h6>
                                </div>
                                <div class="d-none d-lg-flex">
                                    <div class="d-flex">
                                        <div class="nav-item pr-0">
                                            <b-nav-item-dropdown style="width:137px" toggle-class="gray"
                                                                 class="text-gray nav-link px-0"
                                                                 v-if="!store.isLoading">
                                                <template #button-content>
                                                    {{capitalize(store.networkId)}} network
                                                </template>
                                                <b-dropdown-item @click="navigateToNetwork('public')">Public network
                                                </b-dropdown-item>
                                                <b-dropdown-item @click="navigateToNetwork('test')">Test network
                                                </b-dropdown-item>
                                            </b-nav-item-dropdown>
                                            <div v-else style="width:137px"></div>
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
                                </div>
                                <b-navbar-toggle class="my-navbar-toggle" target="nav_collapse"></b-navbar-toggle>
                            </div>
                        </div>
                    </div>

                </b-navbar>
                <b-collapse class="header collapse d-lg-flex p-0" is-nav id="nav_collapse">
                    <div class="container collapser">
                        <div class="row align-items-center">
                            <b-nav-item-dropdown variant="primary" toggle-class="gray" class="ml-0 pl-0 mt-3 d-lg-none"
                                                 v-if="!store.isLoading">
                                <template #button-content>
                                    {{capitalize(store.networkId)}} network
                                </template>
                                <b-dropdown-item @click="navigateToNetwork('public')">Public network</b-dropdown-item>
                                <b-dropdown-item @click="navigateToNetwork('test')">Test network</b-dropdown-item>
                            </b-nav-item-dropdown>
                            <div class="col-lg order-lg-first">
                                <ul class="nav nav-tabs border-0 flex-column flex-lg-row">
                                    <li class="nav-item">
                                        <router-link active-class="active" exact-active-class="active" class="nav-link"
                                                     exact
                                                     :to="{name: 'network-dashboard', query: { view: $route.query.view, network: $route.query.network} }"
                                                     :class="homeActiveClass">
                                            <b-icon-house class="mr-1" scale="0.9"/>
                                            Home
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" exact-active-class="active" class="nav-link"
                                                     :to="{ name: 'nodes', query: { view: $route.query.view, network: $route.query.network} }"
                                                     exact>
                                            <b-icon-bullseye class="mr-1" scale="0.9"/>
                                            Nodes
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" class="nav-link"
                                                     :to="{ name: 'organizations', query: { view: $route.query.view, network: $route.query.network} }"
                                                     exact>
                                            <b-icon-building class="mr-1" scale="0.9"/>
                                            Organizations
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" class="nav-link"
                                                     :to="{ name: 'api', query: { view: $route.query.view, network: $route.query.network} }">
                                            <b-icon-code class="mr-1" scale="0.9"/>
                                            API
                                        </router-link>
                                    </li>
                                    <li class="nav-item">
                                        <router-link active-class="active" class="nav-link"
                                                     :to="{ name: 'faq', query: { view: $route.query.view, network: $route.query.network} }">
                                            <b-icon-question-circle class="mr-1" scale="0.9"/>
                                            FAQ
                                        </router-link>
                                    </li>
                                </ul>

                            </div>
                            <div class="col-lg-3 ml-auto">
                                <form class="input-icon my-3 my-lg-0">
                                    <search v-if="!store.isLoading && !store.fetchingDataFailed"/>
                                </form>
                            </div>

                        </div>
                    </div>

                </b-collapse>
            </div>

            <div class="container h-100 mt-0 mt-md-2">
                <b-alert :show="showError" variant="danger">{{errorMessage}}</b-alert>
                <div v-if="store.isLoading" class="d-flex justify-content-center mt-5">
                    <div class="loader"></div>
                </div>
                <div v-else>
                    <router-view v-if="!store.isLoading && !store.fetchingDataFailed"
                                 :network="network"
                                 :isLoading="store.isLoading"
                    />
                </div>
            </div>
        </div>
        <footer class="footer">
            <div class="d-flex justify-content-between mx-4">
                <router-link active-class="active" class="nav-link"
                             :to="{ name: 'terms-and-conditions', query: { view: $route.query.view, network: $route.query.network} }"
                             exact> Terms and Conditions
                </router-link>
                <div class="nav-item d-none d-lg-flex pr-0">
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
        </footer>
    </div>


</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Watch} from 'vue-property-decorator';
    import Search from '@/components/search.vue';
    import UndoRedo from '@/components/node/tools/simulation/UndoRedo.vue';
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
        BNavbarToggle,
        BFormSelect,
        BIconGlobe2,
        BNavItemDropdown,
        BDropdownItem
    } from 'bootstrap-vue';

    @Component({
        name: 'app',
        components: {
            Github,
            UndoRedo,
            Search,
            BNavbar,
            BNavItemDropdown,
            BDropdownItem,
            BAlert,
            BCollapse,
            BIconBuilding,
            BIconBullseye,
            BIconHouse,
            BIconCode,
            BIconQuestionCircle,
            BIconEnvelope,
            BNavbarToggle,
            BFormSelect,
            BIconGlobe2
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
        protected errorMessage = 'Could not connect to stellarbeat.io api, please refresh the page';
        protected navCollapsed = false;

        @Watch('$route', {immediate: false})
        async onRouteChanged(to: any) {
            let networkId = to.query.network;

            if (!this.store.availableNetworks.includes(to.query.network))
                networkId = 'public';

            if (networkId !== this.store.networkId) {
                this.store.networkId = to.query.network;
                await this.store.fetchData(); //the created hook does not have a filled up route object, so we need to handle it here...
            }

            if (!this.network)
                await this.store.fetchData();

        }

        get store() {
            return this.$root.$data.store;
        }

        get network() {
            return this.store.network;
        }

        get showError() {
            return this.store.fetchingDataFailed;
        }

        get homeActiveClass() {
            return {
                'active': this.$route.name === 'network-dashboard' || this.$route.name === 'node-dashboard' || this.$route.name === 'organization-dashboard'
            };
        }

        capitalize = (word: string) => {
            if (typeof word !== 'string') return '';
            return word.charAt(0).toUpperCase() + word.slice(1);
        };

        navigateToNetwork(networkId: string) {
            if (networkId === this.store.networkId)
                return;

            this.$router.push(
                {
                    name: this.$route.name ? this.$route.name : undefined,
                    params: this.$route.params,
                    query: {'view': this.$route.query.view, 'no-scroll': '1', 'network': networkId},
                },
            ).catch(e => {
                //this triggers a navigation guard error that we can safely ignore. See router beforeEach
            });
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

<style>
    .gray {
        color: #80858a !important;
    }
</style>