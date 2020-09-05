<template>
    <div class="card ">
        <div class="card-header pl-3 d-flex flex-wrap">
            <!--b-button-group size="sm" class="mr-3">
                <b-button :pressed="chartView === '1Y'" @click="select30DayView">1Y</b-button>
                <b-button :pressed="chartView === '30D'" @click="select30DayView">30D</b-button>
                <b-button :pressed="chartView === '24H'" @click="select24HView">24H</b-button>
                <b-button :pressed="chartView === '1H'" @click="select1HView">1H</b-button>
            </b-button-group!-->
            <h1 class="card-title">Quorum availability - liveness analysis</h1>
        </div>
        <div v-if="failed" class="card-alert alert alert-danger mb-0">
            <b-icon-exclamation-triangle/>
            Error fetching data
        </div>
        <div class="card-body d-flex flex-column justify-content-center align-items-center h-100">
            <div class="w-100 h-100" :class="dimmerClass">
                <div class="loader"></div>
                <liveness-aggregation-line-chart v-if="initialDataLoaded" class="dimmer-content" :network-statistics-aggregation="yearStatistics"/>
            </div>
            <date-navigator
                    v-if="initialDataLoaded"
                    :minSelectedDate="statisticsDateTimeNavigator.getMinSelectedDate(bucketSize)"
                    :selectedDate="selectedDate"
                    v-on:dateChanged="updateSelectedDate"
                    :bucket-size="bucketSize"
                    :showTime="bucketSize === '1H'"
                    class="mr-1 mb-1"
            />
        </div>
        <!--div class="card-footer">
            Powered by <a href="https://github.com/wiberlin/fbas_analyzer">@wiberlin/fbas_analyzer</a>
        </div!-->
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js';
    import {Component, Mixins, Prop, Watch} from 'vue-property-decorator';
    import {BTooltip, BIconInfoCircle, BButton, BButtonGroup} from 'bootstrap-vue';
    import DateNavigator from '@/components/date-navigator.vue';
    import moment from 'moment';
    import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';
    import LivenessAggregationLineChart
        from '@/components/network/cards/network-analysis-charts/liveness-aggregation-line-chart.vue';
    import StatisticsDateTimeNavigator
        from '@/components/network/cards/network-analysis-charts/StatisticsDateTimeNavigator';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {LivenessAggregationLineChart, DateNavigator, BTooltip, BIconInfoCircle, BButton, BButtonGroup}
    })
    export default class LivenessAnalysis extends Mixins(IsLoadingMixin, StoreMixin) {
        public chart: Chart | null = null;
        protected selectedDate!: Date;
        protected yearStatistics?: NetworkStatisticsAggregation[];
        protected initialDataLoaded: boolean = false;
        protected statisticsDateTimeNavigator!:StatisticsDateTimeNavigator;
        protected bucketSize: string = '1Y';
        protected failed: boolean = false;

        async updateSelectedDate(newDate: string) {
            this.selectedDate = new Date(newDate);
            if (this.bucketSize === '1Y')
                await this.updateYearChart();
        }

        async updateYearChart() {
            this.isLoading = true;
            let oneYearAgo = moment(this.selectedDate).subtract(1, 'y').toDate();
            try {
                this.failed = false;
                this.yearStatistics = await this.store.networkMeasurementStore.getMonthStatistics('stellar-public', oneYearAgo, this.selectedDate);
            } catch (e) {
                this.failed = true;
            }
            this.isLoading = false;
        }

        public async mounted() {
            this.statisticsDateTimeNavigator = new StatisticsDateTimeNavigator(this.store.measurementsStartDate);
            this.selectedDate = new Date();
            this.selectedDate.setTime(this.statisticsDateTimeNavigator.getInitialSelectedDate(this.bucketSize, this.network.crawlDate).getTime());
            let oneYearAgo = moment(this.selectedDate).subtract(1, 'y').toDate();
            this.yearStatistics = await this.store.networkMeasurementStore.getMonthStatistics('stellar-public', oneYearAgo, new Date());
            this.isLoading = false;
            this.initialDataLoaded = true;
        }

        public beforeDestroy() {
            if (this.chart) {
                this.chart.destroy();
            }
        }

    }
</script>

<style scoped>
    .canvas-container {
        height: 400px;
        width: 100%;
    }
</style>