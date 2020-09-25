<template>
    <div class="row row-cards row-deck">
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveWatchers" :is-loading="isLoading"
                                     title="Watcher nodes" tooltip="Number of active watcher nodes">
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="nrOfActiveWatchersAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveValidators" :is-loading="isLoading"
                                     title="Validator nodes" tooltip="Number of active validators">
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="nrOfActiveValidatorsAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveFullValidators" :is-loading="isLoading"
                                     title="Full validators" tooltip="Number of active full validators">
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="nrOfActiveFullValidatorsAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.nrOfActiveOrganizations" :is-loading="isLoading"
                                     title="Organizations" tooltip="Number of active organizations">
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="nrOfActiveOrganizationsAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.topTierFilteredSize" :is-loading="isLoading"
                                     title="Top tier validators" tooltip="Number of active validators in the top tier">
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="topTierFilteredAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.topTierOrgsFilteredSize" :is-loading="isLoading"
                                     title="Top tier organizations"
                                     tooltip="Number of active organizations in the top tier">
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="topTierOrgsFilteredAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.transitiveQuorumSetSize" :is-loading="isLoading"
                                     title="Transitive quorumset" tooltip="Does the network have a transitive quorumset">
                <template v-slot:value>
                    <b-badge v-if="network.networkStatistics.hasTransitiveQuorumSet" variant="success">
                        yes
                    </b-badge>
                    <b-badge v-else variant="danger">
                        no
                    </b-badge>
                </template>
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded" stats-property="hasTransitiveQuorumSetAverage"
                                              :year-statistics="yearStatistics"/>
                </template>
            </network-statistics-card>
        </div>
        <div class="col-md-6 col-lg-3 col-xl-3">
            <network-statistics-card :value="network.networkStatistics.hasQuorumIntersection ? 'Yes' : 'No'"
                                     :is-loading="isLoading"
                                     title="Quorum intersection" tooltip="Does the network have quorum intersection">
                <template v-slot:value>
                    <b-badge v-if="network.networkStatistics.hasQuorumIntersection" variant="success">
                        yes
                    </b-badge>
                    <b-badge v-else variant="danger">
                        no
                    </b-badge>
                </template>
                <template v-slot:spark>
                    <network-statistics-chart v-if="initialDataLoaded"
                                              stats-property="hasQuorumIntersectionAverage"
                                              :year-statistics="yearStatistics"/>
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
</style>