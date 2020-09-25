<template>
    <div class="row row-cards row-deck">
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveWatchers" :is-loading="isLoading"
                                     title="Watcher nodes" tooltip="Number of active watcher nodes"
                                     :initialDataLoaded="initialDataLoaded" stats-property="nrOfActiveWatchersAverage"
                                     :year-statistics="yearStatistics">
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveValidators" :is-loading="isLoading"
                                     title="Validator nodes" tooltip="Number of active validators"
                                     :initialDataLoaded="initialDataLoaded" stats-property="nrOfActiveValidatorsAverage"
                                     :year-statistics="yearStatistics">
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveFullValidators" :is-loading="isLoading"
                                     title="Full validators" tooltip="Number of active full validators"
                                     :initialDataLoaded="initialDataLoaded" stats-property="nrOfActiveFullValidatorsAverage"
                                     :year-statistics="yearStatistics">
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveOrganizations" :is-loading="isLoading"
                                     title="Organizations" tooltip="Number of active organizations"
                                     :initialDataLoaded="initialDataLoaded" stats-property="nrOfActiveOrganizationsAverage"
                                     :year-statistics="yearStatistics">
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.topTierFilteredSize" :is-loading="isLoading"
                                     title="Top tier validators" tooltip="Number of active validators in the top tier"
                                     :initialDataLoaded="initialDataLoaded" stats-property="topTierFilteredAverage"
                                     :year-statistics="yearStatistics">
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.topTierOrgsFilteredSize" :is-loading="isLoading"
                                     title="Top tier organizations"
                                     tooltip="Number of active organizations in the top tier"
                                     :initialDataLoaded="initialDataLoaded" stats-property="topTierOrgsFilteredAverage"
                                     :year-statistics="yearStatistics">
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.hasTransitiveQuorumSet" :is-loading="isLoading"
                                     :is-bool="true"
                                     title="Transitive quorumset" tooltip="Does the network have a transitive quorumset"
                                     :initialDataLoaded="initialDataLoaded" stats-property="hasTransitiveQuorumSetAverage"
                                     :year-statistics="yearStatistics">
                <template v-slot:value>

                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.hasQuorumIntersection"
                                     :is-bool="true"
                                     :is-loading="isLoading"
                                     title="Quorum intersection" tooltip="Does the network have quorum intersection"
                                     :initialDataLoaded="initialDataLoaded" stats-property="hasQuorumIntersectionAverage"
                                     :year-statistics="yearStatistics">
                <template v-slot:value>
                    <div v-if="network.networkStatistics.hasQuorumIntersection" class="stat-badge">
                        yes
        </div>
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
            let oneYearAgo = moment(new Date()).subtract(1, 'y').toDate();
            this.yearStatistics = await this.store.networkMeasurementStore.getMonthStatistics('stellar-public', oneYearAgo, new Date());
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