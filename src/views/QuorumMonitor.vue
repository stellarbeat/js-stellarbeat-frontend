<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                Quorum Monitor
                <b-badge v-show="store.isSimulation" variant="warning">Simulation</b-badge>
            </h1>
            <crawl-time></crawl-time>
        </div>
        <Statistics
                :network="network"
        ></Statistics>
        <div class="row">
            <div class="col-12">
                <search-card></search-card>
            </div>
        </div>
        <div class="row" v-if="showHaltingAnalysis" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>

        <div class="">
            <div class="row">
                <div class="col-sm-12 col-lg-8">
                    <div class="row">
                        <div class="col-12">
                            <NetworkGraphCard id="quorum-set-explorer-card"></NetworkGraphCard>
                        </div>
                        <div class="col-12">
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 col-sm-12 order-0">
                    <div class="row">
                        <div class="col-12">
                            <quorum-set-explorer-card v-if="selectedNode" class="quorum-set-explorer-card"
                                                      v-on:show-halting-analysis="onShowHaltingAnalysis"
                            ></quorum-set-explorer-card>
                            <div class="card" v-else>
                                <div class="card-header">
                                    <div class="card-title">Network transitive quorumset</div>
                                </div>
                                <div class="card-body py-2 px-0">
                                    <node-list :network="network" :nodes="networkTransitiveQuorumSetNodes"
                                               :render-title="false"
                                    />
                                </div>
                                <div class="card-footer p-3">
                                    <simulate-new-node class="col-12 pl-0"></simulate-new-node>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div class="row" v-if="selectedNode">
                <div class="col-md-6 col-lg-4">
                    <day-statistics-card
                            :subject="'Validating history'"
                            :entityId="selectedNode.publicKey"
                            :fetchDayStatistics="(publicKey, from, to) => store.fetchNodeValidatingDayStatistics(publicKey, from, to)"
                    >
                    </day-statistics-card>
                </div>
                <div class="col-md-6 col-lg-4">
                    <day-statistics-card
                            :subject="'Full validator history'"
                            :entityId="selectedNode.publicKey"
                            :fetchDayStatistics="(publicKey, from, to) => store.fetchNodeFullValidatorDayStatistics(publicKey, from, to)"
                    >
                    </day-statistics-card>
                </div>
                <div class="col-md-6 col-lg-4">
                    <day-statistics-card
                            :subject="'Overloaded history'"
                            :entityId="selectedNode.publicKey"
                            :fetchDayStatistics="(publicKey, from, to) => store.fetchNodeFullValidatorDayStatistics(publicKey, from, to)"
                    >
                    </day-statistics-card>
                </div>
            </div>
        </div>


    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Graph from '../components/quorum-monitor/graph/graph.vue';
    import GraphLegend from '../components/quorum-monitor/graph/graph-legend.vue';
    import QuorumSetExplorer from '../components/quorum-monitor/quorum-set-explorer/quorum-set-explorer.vue';
    import Search from '../components/quorum-monitor/search.vue';
    import Statistics from '../components/statistics.vue';
    import Manual from '../components/quorum-monitor/manual.vue';
    import HaltingAnalysis from '@/components/quorum-monitor/halting-analysis/halting-analysis.vue';

    import {Node, Network, QuorumSet, PublicKey} from '@stellarbeat/js-stellar-domain';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import UndoRedo from '@/components/quorum-monitor/UndoRedo.vue';
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import NodeList from '@/components/quorum-monitor/quorum-set-explorer/node-list.vue';
    import Store from '@/Store';
    import SearchCard from '@/components/quorum-monitor/cards/search-card.vue';
    import NetworkGraphCard from '@/components/quorum-monitor/cards/network-graph-card.vue';
    import QuorumSetExplorerCard from '@/components/quorum-monitor/cards/quorum-set-explorer-card.vue';
    import ValidatingHistoryCard from '@/components/quorum-monitor/cards/validating-history-card.vue';
    import DayStatisticsCard from '@/components/quorum-monitor/cards/day-statistics-card.vue';
    import SimulateNewNode from '@/components/quorum-monitor/quorum-set-explorer/simulate-new-node.vue';
    import CrawlTime from '@/components/crawl-time.vue';

    @Component({
        name: 'quorum-monitor',
        components: {
            SimulateNewNode,
            ValidatingHistoryCard,
            DayStatisticsCard: DayStatisticsCard,
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
            Manual,
            HaltingAnalysis,
            CrawlTime
        },
        metaInfo: {
            title: 'Quorum monitor - Stellarbeat.io',
            meta: [
                {name: 'description', content: 'Inspect quorum set connections and metrics about network health'},
            ],
        },
    })
    export default class QuorumMonitor extends Vue {
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

        get network() {
            return this.$root.$data.store.network;
        }

        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.graph.networkTransitiveQuorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey));
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
            }
            if (!this.selectedNode) {
                this.$router.push(
                    {
                        name: 'quorum-monitor'
                    },
                );
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