<template>
    <div>
        <Statistics
                :network="network"
        ></Statistics>
        <div class="row row-cards row-deck" v-if="showHaltingAnalysis" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>
        <!--div class="page-header">
                    <h1 class="page-title">
                        Stellar Public Network
                    </h1>
                    <div class="page-subtitle"></div>
                    <div class="page-options d-flex">
                        <crawl-time/>
                        <div class="input-icon ml-2">
                          <span class="input-icon-addon">
                            <i class="fe fe-search"></i>
                          </span>
                            <search></search>
                        </div>
                    </div>
                </div!-->
        <div class="">
            <div class="row row-cards row-deck">
                <div class="col-sm-5 col-md-4 col-lg-3 col-xl-2">
                    <network-side-bar/>
                </div>
                <div class="col-sm-7 col-md-8 col-lg-9 col-xl-10">
                    <div class="row">
                        <div class="col-12">
                            <network-visual-navigator></network-visual-navigator>
                        </div>
                    </div>
                    <div class="row row-cards" v-if="!selectedNode">
                        <div class="col-md-12 col-lg-4 col-xl-5">
                            <NodesCountryDistribution :network="network"></NodesCountryDistribution>
                            <NodesVersions :network="network"></NodesVersions>
                            <ValidatorsServerLoad :network="network"></ValidatorsServerLoad>
                        </div>
                        <div class="col-xl-7 col-lg-8 col-md-12">
                            <QuorumSetConnections :network="network"></QuorumSetConnections>
                        </div>
                    </div>
                    <div class="row row-cards row-deck" v-else>
                        <div class="col-md-6 col-lg-4">
                            <history-card
                                    :subject="'Validating history'"
                                    :entityId="selectedNode.publicKey"
                                    :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                                    :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                                    :dayMeasurementProperty="'isValidatingCount'"
                                    :measurementProperty="'isValidating'"
                                    :chartType="'bar'"
                            >
                            </history-card>
                        </div>
                        <div class="col-md-6 col-lg-4">
                            <history-card
                                    :subject="'Full validator history'"
                                    :entityId="selectedNode.publicKey"
                                    :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                                    :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                                    :dayMeasurementProperty="'isFullValidatorCount'"
                                    :measurementProperty="'isFullValidator'"
                            >
                            </history-card>
                        </div>
                        <div class="col-md-6 col-lg-4">
                            <history-card
                                    :subject="'Overloaded history'"
                                    :entityId="selectedNode.publicKey"
                                    :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                                    :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                                    :dayMeasurementProperty="'isOverloadedCount'"
                                    :measurementProperty="'isOverLoaded'"
                                    :inverted="true"
                            >
                            </history-card>
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
    import HistoryCard from '@/components/node/node-cards/history-card.vue';
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
        name: 'network',
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
    export default class Home extends Vue {
        protected showHaltingAnalysis: boolean = false;
        protected haltingAnalysisPublicKey: PublicKey | null = null;

        @Watch('$route')
        public on$routeChanged(to: any) {
            this.store.quorumMonitorStore.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
            if (to.query.center === '1') {
                this.store.quorumMonitorStore.centerNode = this.store.quorumMonitorStore.selectedNode;
            }
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get network(): Network {
            return this.$root.$data.store.network;
        }

        onShowHaltingAnalysis(publicKey: PublicKey) {
            this.haltingAnalysisPublicKey = publicKey;
            this.showHaltingAnalysis = true;

            this.$nextTick(() => {
                this.$scrollTo('#halting-analysis-card');
            });
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
                this.store.quorumMonitorStore.selectedNode = this.network.getNodeByPublicKey(this.$route.params['publicKey']);
                if (!this.selectedNode) {
                    this.$router.push(
                        {
                            name: 'quorum-monitor'
                        },
                    );
                }
            } else {
                this.store.quorumMonitorStore.selectedNode = undefined;
            }

            if (this.$route.query['center'] === '1' || this.$route.query['center'] === undefined) {
                this.store.quorumMonitorStore.centerNode = this.selectedNode;
            }
        }

        public beforeDestroy() {
            if (this.isSimulation) { // undo simulation
                this.store.resetUpdates();
            } // todo: better way to manage network adjustments
        }
    }
</script>

<style scoped>

</style>