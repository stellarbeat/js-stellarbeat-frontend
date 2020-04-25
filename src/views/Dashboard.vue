<template>
    <div>
        <div class="page-header d-flex justify-content-between">
            <div class="d-flex align-items-center">
                <h1 class="page-title"> Dashboard</h1>
                <simulation-badge/>
            </div>
            <crawl-time class=""/>
        </div>
        <Statistics :network="network"/>
        <div class="row row-cards row-deck" v-if="store.isHaltingAnalysisVisible" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="store.haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>
        <div class="row align-items-stretch">
            <aside class="side-bar col-xs-12 col-sm-5 col-lg-4 col-xl-auto mb-5">
                <transition
                        name="fade"
                        mode="out-in"
                >
                    <router-view name="sideBar" class="h-100 side-bar"/>
                </transition>
            </aside>
            <div class="col-sm-7 col-lg-8 col-xl" id="content">
                <div class="row">
                    <div class="col">
                        <network-visual-navigator :view="view"/>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <router-view name="dashboard"/>
                    </div>
                </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Search from '../components/node/search.vue';
    import Statistics from '../components/statistics.vue';
    import HaltingAnalysis from '@/components/node/halting-analysis/halting-analysis.vue';
    import {Node, Network, QuorumSet, PublicKey} from '@stellarbeat/js-stellar-domain';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import NetworkVisualNavigator from '@/components/visual-navigator/network-visual-navigator.vue';
    import NetworkSideBar from '@/components/side-bar/network/network-side-bar.vue';
    import CrawlTime from '@/components/crawl-time.vue';
    import SimulationBadge from '@/components/simulation-badge.vue';

    @Component({
        name: 'dashboard',
        components: {
            SimulationBadge,
            CrawlTime,
            NetworkSideBar,
            NetworkVisualNavigator,
            Search,
            Statistics,
            HaltingAnalysis
        }
    })
    export default class Dashboard extends Vue {
        @Prop({default: 'map'})
        public view!: string;

        @Watch('$route')
        public on$routeChanged(to: any) {
            this.store.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
            this.store.selectedOrganization = this.network.getOrganizationById(to.params.organizationId);
            if (to.query.center === '1') {
                this.store.centerNode = this.store.selectedNode;
            }
        }

        @Watch('store.haltingAnalysisPublicKey')
        public onHaltingAnalysisPublicKeyChanged(publicKey?: string) {
            if (publicKey)
                this.$nextTick(() => {
                    this.$scrollTo('#halting-analysis-card');
                });
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get network(): Network {
            return this.$root.$data.store.network;
        }

        public updateValidatingStates(updates: Array<{ 'publicKey': PublicKey, 'validating': boolean }>) {
            this.store.updateValidatingStates(updates);
        }

        get isSimulation(): boolean {
            return this.store.isSimulation;
        }

        public created() {
            // fix centering and selection in graph
            if (this.$route.params['publicKey']) {
                this.store.selectedNode = this.network.getNodeByPublicKey(this.$route.params['publicKey']);
                if (!this.store.selectedNode) {
                    this.$router.push(
                        {
                            name: 'network-dashboard', query: {view: this.$route.query.view}
                        },
                    );
                }
            }

            if (this.$route.params['organizationId']) {
                this.store.selectedOrganization = this.network.getOrganizationById(this.$route.params['organizationId']);
                if (!this.store.selectedOrganization) {
                    this.$router.push(
                        {
                            name: 'network-dashboard', query: {view: this.$route.query.view}
                        },
                    );
                }
            }
            if (this.$route.query['center'] === '1' || this.$route.query['center'] === undefined) {
                this.store.centerNode = this.selectedNode;
            }
        }
    }
</script>

<style>
    .dashboard-container {
        flex-direction: column;
        align-items: stretch;
    }

    @media (min-width: 1200px) {
        .side-bar {
            width: 275px;
        }
    }

    .sb-card-title {
        line-height: 1 !important;
        margin-bottom: 2px !important;
    }

    .sb-card-title-icon {
        opacity: 0.8;
        color: #1997c6;
    }

    .sb-card-header {
        border: none !important;
        margin-top: 18px;
        margin-bottom: 5px;
        margin-left: 0px;
        padding-left: 21px !important;
    }

    .title-icon {
        font-size: 2rem;
        margin-bottom: 0;
    }

    .sb-card-subtitle {
        opacity: 0.7;
        font-weight: 500;
        margin-bottom: 0;
    }

    .sb-navbar-heading {
        font-size: .6875rem;
        font-weight: 600;
        text-transform: uppercase;
        text-align: left;
        letter-spacing: .04em;
        color: #868c97;
        display: block;
        margin-bottom: 8px;
        padding-left: 5px;
    }

    .sb-nav-bar {
        list-style: none;
        flex: 0 0 220px;
    }

    .sb-nav-list {
        padding-left: 0px;
    }

    .sb-nav-item {
        width: 100%;
        color: rgba(0, 0, 0, .55);
        font-weight: 400;
        font-size: 100%;
        text-decoration: none;
        list-style: none;
        margin-bottom: 1px;
        margin-top: 1px;
    }

    .sb-nav-dropdown {
        margin-left: 0em;
    }
</style>