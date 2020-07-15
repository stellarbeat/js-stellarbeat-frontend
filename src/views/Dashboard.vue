<template>
    <div>
        <div class="page-header d-flex justify-content-between">
            <div class="d-flex align-items-center">
                <h2 class="page-title"> Dashboard</h2>
                <simulation-badge class="mr-2"/>
                <time-travel-badge/>
            </div>
            <crawl-time class=""/>
        </div>
        <div class="row row-cards row-deck" v-if="store.isHaltingAnalysisVisible" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="store.haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>
        <div class="row">
            <aside class="side-bar col-xs-12 col-sm-5 col-lg-3 col-xl-auto mb-5">
                <div class="card pt-0 sidebar-card h-100">
                    <transition
                            name="fade"
                            mode="out-in"
                    >
                        <router-view name="sideBar" class="h-100 side-bar"/>
                    </transition>
                </div>
            </aside>
            <div class="col-sm-7 col-lg-9 col-xl" id="content">
                <div class="row">
                    <div class="col">
                        <network-visual-navigator :view="view"/>
                    </div>
                </div>
                <!--div class="row">
                    <div class="col">
                        <div class="card border" id="map">
                            <div class="card-body border-0 pt-3 px-3 pb-0">
                                <div v-if="network.graph.networkTransitiveQuorumSet.size === 0"
                                     class="card-alert alert alert-danger" show>No transitive quorum set detected in network!
                                </div>
                                <world-map/>
                            </div>
                            <div class="card-footer border-0 px-3 py-1">
                                <div class="pl-0 sb-bread-crumbs-container">
                                    <transition
                                            name="fade"
                                            mode="out-in"
                                    >
                                        <b-breadcrumb class="sb-bread-crumbs p-0 mb-0" :items="breadCrumbs">
                                        </b-breadcrumb>
                                    </transition>
                                </div>
                            </div>
                        </div>
                    </div>
                </div!-->
                <div class="row">
                    <div class="col-12">
                        <router-view name="dashboard"/>
                    </div>
                </div>
                <!--div class="row">
                    <div class="col">
                        <div class="card border" id="graph">
                            <div class="card-body border-0 p-3">
                                <network-graph-card/>
                            </div>
                        </div>
                    </div>
                </div!-->
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Search from '../components/search.vue';
    import NetworkStatistics from '../components/network/cards/network-statistics.vue';
    import HaltingAnalysis from '@/components/node/halting-analysis/halting-analysis.vue';
    import {Node, Network, QuorumSet, PublicKey} from '@stellarbeat/js-stellar-domain';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import NetworkVisualNavigator from '@/components/visual-navigator/network-visual-navigator.vue';
    import NetworkSideBar from '@/components/network/sidebar/network-side-bar.vue';
    import CrawlTime from '@/components/crawl-time.vue';
    import SimulationBadge from '@/components/simulation-badge.vue';
    import TimeTravelBadge from '@/components/time-travel-badge.vue';
    import {BBreadcrumb} from 'bootstrap-vue';

    @Component({
        name: 'dashboard',
        components: {
            TimeTravelBadge,
            SimulationBadge,
            CrawlTime,
            NetworkSideBar,
            NetworkVisualNavigator,
            Search,
            Statistics: NetworkStatistics,
            HaltingAnalysis,
            BBreadcrumb: BBreadcrumb
        }
    })
    export default class Dashboard extends Vue {
        @Prop({default: 'graph'})
        public view!: string;

        @Watch('$route', {immediate: true})
        public onRouteChanged(to: any) {
            if(to.params.publicKey){
                this.store.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
                if (!this.store.selectedNode) {
                    this.$router.push(
                        {
                            name: 'network-dashboard', query: {view: this.$route.query.view}
                        },
                    );
                }
            } else
                this.store.selectedNode = undefined;
            if(to.params.organizationId){
                this.store.selectedOrganization = this.network.getOrganizationById(to.params.organizationId);
                if (!this.store.selectedOrganization) {
                    this.$router.push(
                        {
                            name: 'network-dashboard', query: {view: this.$route.query.view}
                        },
                    );
                }
            } else
                this.store.selectedOrganization = undefined;

            if (to.query.center === '1' || to.query.center === undefined) {
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

        get breadCrumbs() {
            let crumbs = [];
            crumbs.push({
                text: 'Stellar Public Network',
                to: {name: 'network-dashboard'}
            });

            if (this.selectedNode) {
                if (this.selectedNode.organizationId)
                    crumbs.push({
                        text: this.network.getOrganizationById(this.selectedNode.organizationId)!.name,
                        to: {name: 'organization-dashboard', params: { 'organizationId': this.selectedNode.organizationId}},
                        active: false
                    });
                crumbs.push({
                    text: this.selectedNode.displayName,
                    active: true
                });
            } else if (this.selectedOrganization)
                crumbs.push({
                    text: this.selectedOrganization.name,
                    active: true
                });
            return crumbs;
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
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
    }
</script>

<style>
    .dashboard-container {
        flex-direction: column;
        align-items: stretch;
    }

    @media (min-width: 1279px) {
        .side-bar {
            width: 272px;
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
    .sb-bread-crumbs {
        background: white!important;
        margin: 0px;
        padding: 0px;
        align-self: center;
    }
</style>