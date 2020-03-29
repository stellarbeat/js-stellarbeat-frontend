<template>
    <div>
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
        <div class="d-flex dashboard-container">
            <aside class="side-bar">
                <transition
                        name="fade"
                        mode="out-in"
                >
                    <router-view name="sideBar"/>
                </transition>
            </aside>
            <div class="row content" id="content">
                <div class="col-12">
                    <div class="row">
                        <div class="col-12">
                            <network-visual-navigator/>
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
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Graph from '../components/visual-navigator/graph/graph.vue';
    import GraphLegend from '../components/visual-navigator/graph/graph-legend.vue';
    import QuorumSetExplorer from '../components/quorum-monitor-deprecated/quorum-set-explorer/quorum-set-explorer.vue';
    import Search from '../components/node/search.vue';
    import Statistics from '../components/statistics.vue';
    import HaltingAnalysis from '@/components/node/halting-analysis/halting-analysis.vue';
    import {Node, Network, QuorumSet, PublicKey} from '@stellarbeat/js-stellar-domain';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import UndoRedo from '@/components/node/UndoRedo.vue';
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import NodeList from '@/components/quorum-monitor-deprecated/quorum-set-explorer/node-list.vue';
    import Store from '@/store/Store';
    import SearchCard from '@/components/node/node-cards/search-card.vue';
    import NetworkGraphCard from '@/components/visual-navigator/network-graph-card.vue';
    import QuorumSetExplorerCard from '@/components/node/node-cards/quorum-set-explorer-card.vue';
    import HistoryCard from '@/components/charts/history-card.vue';
    import SimulateNewNode from '@/components/quorum-monitor-deprecated/quorum-set-explorer/simulate-new-node.vue';
    import CrawlTime from '@/components/crawl-time.vue';
    import OrganizationList from '@/components/quorum-monitor-deprecated/quorum-set-explorer/organization-list.vue';
    import NetworkVisualNavigator from '@/components/visual-navigator/network-visual-navigator.vue';
    import QuorumSetConnections from '@/components/network/cards/quorum-set-connections/quorum-set-connections.vue';
    import ValidatorsServerLoad from '@/components/network/cards/validator-load.vue';
    import NodesCountryDistribution from '@/components/network/cards/nodes-country-distribution.vue';
    import NodesVersions from '@/components/network/cards/nodes-versions.vue';
    import NetworkSideBar from '@/components/side-bar/network/network-side-bar.vue';

    @Component({
        name: 'dashboard',
        components: {
            NetworkSideBar,
            NodesVersions,
            NodesCountryDistribution,
            ValidatorsServerLoad,
            QuorumSetConnections,
            NetworkVisualNavigator,
            OrganizationList,
            HistoryCard,
            SimulateNewNode,
            QuorumSetExplorerCard,
            NetworkGraphCard,
            SearchCard,
            NodeList,
            FullValidatorTitle,
            UndoRedo,
            QuorumSetExplorer,
            Graph,
            GraphLegend,
            Search,
            Statistics,
            HaltingAnalysis,
            CrawlTime
        }
    })
    export default class Dashboard extends Vue {
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
                            name: 'network-dashboard'
                        },
                    );
                }
            }

            if (this.$route.params['organizationId']) {
                this.store.selectedOrganization = this.network.getOrganizationById(this.$route.params['organizationId']);
                if (!this.store.selectedOrganization) {
                    this.$router.push(
                        {
                            name: 'network-dashboard'
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

    .side-bar {

    }

    @media (min-width: 666px) {
        .side-bar {
            flex: 0 0 270px;
            margin-right: 20px;
        }

        .dashboard-container {
            flex-direction: row;
        }

        .content {
            width: 100%;
        }
    }

    .sb-card-title-icon {
        opacity: 0.6;
        width: 30px;
        color: #1997c6;
    }

    .sb-card-header {
        border: none !important;
        margin-top: 10px;
        margin-bottom: 0px;
        margin-left: 4px;
    }

    .sb-card-title {
        text-transform: capitalize;
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