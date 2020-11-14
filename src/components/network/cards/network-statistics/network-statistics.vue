<template>
    <div class="row row-cards row-deck">
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveWatchers" :is-loading="isLoading"
                                     title="Watcher nodes" tooltip="Number of active watcher nodes"
                                     :initialDataLoaded="initialDataLoaded" stats-property="nrOfActiveWatchersAverage"
                                     :year-statistics="yearStatistics">
                <template v-slot:info>
                    <h3>Watcher nodes</h3>
                    <p class="my-4">
                        Watcher nodes are configured to watch the activity from the network. They do not actively vote on the network.
                    </p>

                    <h4>What if your node is missing?</h4>
                    <p>
                        A common issue is a closed port (default: 11625). Send us an <a
                            href="mailto:stellarbeatio@gmail.com"
                            target="_blank"> e-mail</a> if the problem persists.
                    </p>

                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveValidators" :is-loading="isLoading"
                                     title="Validator nodes" tooltip="Number of active validators"
                                     :initialDataLoaded="initialDataLoaded" stats-property="nrOfActiveValidatorsAverage"
                                     :year-statistics="yearStatistics">
                <template v-slot:info>
                    <h3>Validator nodes</h3>
                    <p class="my-4">
                        Nodes that are actively voting on the network in the current crawl.
                    </p>

                    <h4>What if your node not showing up?</h4>
                    <p>
                        A common issue is a closed port (default: 11625). Send us an <a
                            href="mailto:stellarbeatio@gmail.com"
                            target="_blank"> e-mail</a> if the problem persists.
                    </p>

                    <h4>How to update the name of your validator?</h4>
                    <p>
                        Support <a
                            target="_blank"
                            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md">sep-0020</a>
                        and update the linked <a target="_blank"
                                                 href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
                        file to include your validator info.
                    </p>
                    <h4>
                        What if your node is validating, but stellarbeat labels it as not validating?
                    </h4>
                    <ul>
                        <li>
                            Stellarbeat detects nodes validating in a specific crawl/time window. It could be the validator is too slow for this window, or catching up.
                        </li>
                        <li>
                            If stellarbeat cannot connect to the node because it is at max capacity and the node is not trusted by other nodes, stellarbeat cannot detect the validating status and the node is marked as not validating.
                        </li>
                    </ul>
                </template>
            </network-statistics-card>
        </div>
        <div  v-if="!store.isSimulation" class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveFullValidators" :is-loading="isLoading"
                                     title="Full validators" tooltip="Number of active full validators"
                                     :initialDataLoaded="initialDataLoaded"
                                     stats-property="nrOfActiveFullValidatorsAverage"
                                     :year-statistics="yearStatistics">

                <template v-slot:info>
                    <h3>Full validators</h3>
                    <p class="my-4">
                        In addition to voting on the network, a full validator manages an up-to-date history archive in long term storage.
                    </p>
                    <h4>How does my node gain full validator status?</h4>
                    <p>
                        Support <a
                            target="_blank"
                            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md">sep-0020</a>
                        and update the linked <a target="_blank"
                                                 href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
                        file to include your history archive url's and make sure the archive(s) are up-to-date.
                    </p>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveOrganizations" :is-loading="isLoading"
                                     title="Organizations" tooltip="Number of active organizations"
                                     :initialDataLoaded="initialDataLoaded"
                                     stats-property="nrOfActiveOrganizationsAverage"
                                     :year-statistics="yearStatistics">
                <template v-slot:info>
                    <h3>Active Organizations</h3>
                    <p class="my-4">
                        Nodes are grouped into organizations. Organizations are active when a majority of it's nodes are validating.
                    </p>
                    <h4>How can you add your organization?</h4>
                    <p>
                        Support <a
                            target="_blank"
                            href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md">sep-0020</a>
                        and update the linked <a target="_blank"
                                                 href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
                        file to include your organization and validator info.
                    </p>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3" v-if="!store.isSimulation" >
            <network-statistics-card :value="network.networkStatistics.topTierFilteredSize" :is-loading="isLoading"
                                     title="Top tier validators" tooltip="Number of active validators in the top tier"
                                     :initialDataLoaded="initialDataLoaded" stats-property="topTierFilteredAverage"
                                     :year-statistics="yearStatistics" :is-simulation-sensitive="true">
                <template v-slot:info>
                    <h3>Top tier active validators</h3>
                    <p class="my-4">
                        The top tier is the set of nodes in the network that is exclusively relevant when determining the liveness and safety "buffers" of the network.
                    </p>

                    <p class="my-4">
                        If you want to learn more about the top tier concept, check out the following
                        <a target="_blank" href="https://arxiv.org/pdf/2002.08101.pdf">white paper</a>
                    </p>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3" v-if="!store.isSimulation" >
            <network-statistics-card :value="network.networkStatistics.topTierOrgsFilteredSize" :is-loading="isLoading"
                                     title="Top tier organizations"
                                     tooltip="Number of active organizations in the top tier"
                                     :initialDataLoaded="initialDataLoaded" stats-property="topTierOrgsFilteredAverage"
                                     :year-statistics="yearStatistics"  :is-simulation-sensitive="true">
                <template v-slot:info>
                    <h3>Top tier active organizations</h3>
                    <p class="my-4">
                        The top tier grouped by organization.
                    </p>

                    <p class="my-4">
                        If you want to learn more about the top tier concept, check out the following
                        <a target="_blank" href="https://arxiv.org/pdf/2002.08101.pdf">white paper</a>
                    </p>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.hasTransitiveQuorumSet" :is-loading="isLoading"
                                     :is-bool="true"
                                     title="Transitive quorum set" tooltip="Does the network have a transitive quorum set"
                                     :initialDataLoaded="initialDataLoaded"
                                     stats-property="hasTransitiveQuorumSetAverage"
                                     :year-statistics="yearStatistics">
                <template v-slot:info>
                    <h3>Network transitive quorum set</h3>
                    <p class="my-4">
                        The network transitive quorum set is a heuristic for a correctly configured network.<br/>
                        It is the most important strongly connected component that has no outgoing edges. <br/>In the main graph above, it is marked with a light blue background.
                    </p>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3" v-if="!store.isSimulation">
            <network-statistics-card :value="network.networkStatistics.hasQuorumIntersection"
                                     :is-bool="true"
                                     :is-loading="isLoading"
                                     title="Quorum intersection" tooltip="Does the network have quorum intersection"
                                     :initialDataLoaded="initialDataLoaded"
                                     stats-property="hasQuorumIntersectionAverage"
                                     :year-statistics="yearStatistics"  :is-simulation-sensitive="true">
                <template v-slot:info>
                    <h3>Quorum intersection</h3>
                    <p class="my-4">
                        A prerequisite for network safety. Indicates that all quorums are overlapping.
                    </p>
                    <h4>Limitations</h4>
                    <p class="my-4">
                        If quorum intersection is failing, additional analysis is needed. Safety could still be present for the majority of the network.<br/>
                        Because quorum intersection is calculated for the entire network, it could be that badly configured nodes on the edge of the network can cause quorum intersection to fail.<br/>
                        To mitigate this, stellarbeat filters out 'badly configured' nodes. At the moment these are nodes that have only themselves in their quorumset.
                    </p>
                </template>
            </network-statistics-card>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Mixins, Prop} from 'vue-property-decorator';
    import {BTooltip, BIconInfoCircle, BBadge} from 'bootstrap-vue';
    import Chart from 'chart.js';
    import {StoreMixin} from '@/mixins/StoreMixin';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import moment from 'moment';
    import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';
    import NetworkStatisticsChart from '@/components/network/cards/network-statistics/network-statistics-chart.vue';
    import NetworkStatisticsCard from '@/components/network/cards/network-statistics/network-statistics-card.vue';

    @Component({
        components: {NetworkStatisticsCard, NetworkStatisticsChart, BTooltip, BIconInfoCircle, BBadge}
    })
    export default class NetworkStatistics extends Mixins(StoreMixin, IsLoadingMixin) {
        public chart!: Chart;
        protected initialDataLoaded: boolean = false;
        protected yearStatistics: NetworkStatisticsAggregation[] = [];

        public async mounted() {
            if(!this.store.isSimulation) {
                let oneYearAgo = moment(this.network.crawlDate).subtract(1, 'y').toDate();
                this.yearStatistics = await this.store.networkMeasurementStore.getMonthStatistics('stellar-public', oneYearAgo, this.network.crawlDate);
            }
            this.isLoading = false;
            this.initialDataLoaded = true;
        }
    }
</script>

<style scoped>
    .info {
        float: right;
        padding-bottom: 1px;
        opacity: 0.5;
    }

    .stat-badge {
        color: #5eba00;
    }
</style>