<template>
    <div>
        <div v-show="false" class="page-header">
            <div class="row align-items-center">
                <div class="col-auto">
                    <h2 class="page-title">
                        Dashboard
                    </h2>
                </div>
                <!-- Page title actions -->
                <div class="col-auto ml-auto d-print-none">
                    <crawl-time></crawl-time>
                </div>
            </div>
        </div>
        <!--Statistics Show only for network, and show simulation results in separate window when 'simulating'
                :network="network"
        ></Statistics!-->

        <div class="d-flex">
            <ol class="breadcrumb mr-2" aria-label="breadcrumbs">
                <li class="breadcrumb-item"><a href="#">Network</a></li>
                <li class="breadcrumb-item"><a href="#">Nodes</a></li>
                <li class="breadcrumb-item active"><a href="#"> {{selectedNode.displayName}} </a></li>
            </ol>
            <div class="">
        <span class="badge sb-badge mr-1"
              v-bind:class="[selectedNode.isFullValidator || selectedNode.isValidator ? 'badge-success ' : 'badge-default']"
        >
                    {{selectedNode.isFullValidator ? 'Full Validator' :
                    selectedNode.isValidator ? 'Validator' : 'Watcher Node'}}
                </span>
                <span v-if="selectedNode.isValidating && !network.isNodeFailing(this.selectedNode)"
                      class="badge sb-badge badge-success mr-1"
                >Validating
                </span>
                <span v-if="selectedNodePartOfTransitiveQuorumSet" class="badge sb-badge badge-primary"
                >Transitive Quorum Set
                </span>
                <span v-if="selectedNode.versionStr" class="badge badge-default sb-badge mr-1"
                      v-b-popover.hover.top="selectedNode.versionStr">{{selectedNode.versionStr | truncate(35)}}</span>
            </div>
        </div>
        <div class="row row-cards row-deck" v-if="showHaltingAnalysis" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>

        <div class="">
            <div class="row row-cards row-deck">
                <div class="col-sm-12 col-lg-12">
                    <network-visual-navigator></network-visual-navigator>
                </div>
            </div>
        </div>
        <div class="row row-cards row-deck" v-if="selectedNode">
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
        <div v-else class="row">
            <div class="col-md-12 col-lg-4 col-xl-3">
                <div class="row row-cards row-deck">
                    <div class="col-lg-12 col-md-6">
                        <transitive-quorum-set-organizations-card/>
                    </div>
                    <div class="col-lg-12 col-md-6">
                        <NodesCountryDistribution :network="network"></NodesCountryDistribution>
                    </div>
                </div>
            </div>
            <div class="col-xl-5 col-lg-8 col-md-12">
                <QuorumSetConnections :network="network"></QuorumSetConnections>
            </div>
            <div class="col-xl-4 col-lg-12 col-md-12">
                <div class="row row-cards row-deck">
                    <div class="col-xl-12 col-lg-6 col-md-6">
                        <NodesVersions :network="network"></NodesVersions>
                    </div>
                    <div class="col-xl-12 col-lg-6 col-md-6">
                        <ValidatorsServerLoad :network="network"></ValidatorsServerLoad>
                    </div>
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
    import Store from '@/store/Store';
    import SearchCard from '@/components/quorum-monitor/cards/search-card.vue';
    import NetworkGraphCard from '@/components/quorum-monitor/cards/network-graph-card.vue';
    import QuorumSetExplorerCard from '@/components/quorum-monitor/cards/quorum-set-explorer-card.vue';
    import HistoryCard from '@/components/quorum-monitor/cards/history-card.vue';
    import SimulateNewNode from '@/components/quorum-monitor/quorum-set-explorer/simulate-new-node.vue';
    import CrawlTime from '@/components/crawl-time.vue';
    import OrganizationList from '@/components/quorum-monitor/quorum-set-explorer/organization-list.vue';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import NetworkVisualNavigator from '@/components/quorum-monitor/cards/network-visual-navigator.vue';
    import QuorumSetConnections from '@/components/home/quorum-set-connections/quorum-set-connections.vue';
    import ValidatorsServerLoad from '@/components/home/validator-load.vue';
    import NodesCountryDistribution from '@/components/home/nodes-country-distribution.vue';
    import NodesVersions from '@/components/home/nodes-versions.vue';
    import TransitiveQuorumSetValidatorsCard
        from '@/components/quorum-monitor/cards/transitive-quorum-set-validators-card.vue';
    import TransitiveQuorumSetOrganizationsCard
        from '@/components/quorum-monitor/cards/transitive-quorum-set-organizations-card.vue';

    @Component({
        name: 'quorum-monitor',
        components: {
            TransitiveQuorumSetOrganizationsCard,
            TransitiveQuorumSetValidatorsCard,
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