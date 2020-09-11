<template>
    <div class="card ">
        <div class="card-header pl-3 d-flex flex-wrap">
            <b-button-group size="sm" class="mr-3">
                <b-button :pressed="bucketSize === '1Y'" @click="select1YView">1Y</b-button>
                <b-button :pressed="bucketSize === '30D'" @click="select30DayView">30D</b-button>
                <b-button :pressed="bucketSize === '24H'" @click="select24HView">24H</b-button>
            </b-button-group>
            <h1 class="card-title">{{capitalizeFirstLetter(analysisType)}} analysis</h1>
        </div>
        <div v-if="failed" class="card-alert alert alert-danger mb-0">
            <b-icon-exclamation-triangle/>
            Error fetching data
        </div>
        <div class="card-body d-flex flex-column justify-content-center align-items-center h-100 px-0 pt-0 pb-3">
            <div class="w-100 h-100" :class="dimmerClass">
                <div class="loader"></div>
                <div v-if="initialDataLoaded" style="height: 240px" class="dimmer-content">
                    <aggregation-line-chart v-if="bucketSize === '1Y'" :chartDataSets="yearChartDataSets"
                                                     :chartLabels="getAggregatedLabels" :unit="'month'" :tooltip-time-format="'MMM YYYY'"
                                                     :time-display-formats="{'month': 'MMM YYYY'}" :step-size="1"
                                                     :chartLabelFilter="aggregatedChartLabelFilter"
                                                     :key="'1'" @click-date="select30DayView"/>
                    <aggregation-line-chart v-if="bucketSize === '30D'" :chartDataSets="day30ChartDataSets"
                                                     :chartLabels="getAggregatedLabels" :unit="'day'" :tooltip-time-format="'D-M-YYYY'"
                                                     :time-display-formats="{'day': 'D-M-YYYY'}" :step-size="2"
                                                     :chartLabelFilter="aggregatedChartLabelFilter"
                                                     :key="'2'" @click-date="select24HView"/>
                    <aggregation-line-chart v-if="bucketSize === '24H'" :unit="'minute'" :tooltip-time-format="'D-M-YYYY HH:mm'"
                                                     :time-display-formats="{'minute': 'HH:mm'}" :step-size="4" point-radius="0"
                                                     :chart-data-sets="hour24ChartDataSets"
                                                     :chartLabels="getLabels" :key="'3'" @click-date="updateSelectedDateAndHighlight"/>
                </div>
            </div>
            <div class="d-flex flex-wrap mt-1" :class="{'animated': animated}" @animationend="animated = false">
                <date-navigator
                                v-if="initialDataLoaded"
                                :minSelectedDate="statisticsDateTimeNavigator.getMinSelectedDate(bucketSize)"
                                :selectedDate="selectedDate"
                                v-on:dateChanged="updateSelectedDate"
                                :bucket-size="bucketSize"
                                :showTime="bucketSize === '24H'"
                                class="mr-1 mb-0 mt-1"
                />
            </div>
        </div>
        <!--div class="card-footer">
            Powered by <a href="https://github.com/wiberlin/fbas_analyzer">@wiberlin/fbas_analyzer</a>
        </div!-->
    </div>
</template>

<script lang="ts">
    import Chart, {ChartData, ChartDataSets, ChartLegendLabelItem, ChartTooltipItem} from 'chart.js';
    import {Component, Mixins, Prop, Watch} from 'vue-property-decorator';
    import {BTooltip, BIconInfoCircle, BButton, BButtonGroup, BIconExclamationCircle} from 'bootstrap-vue';
    import DateNavigator from '@/components/date-navigator.vue';
    import moment from 'moment';
    import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';
    import AggregationLineChart
        from '@/components/network/cards/network-analysis-charts/aggregation-line-chart.vue';
    import StatisticsDateTimeNavigator
        from '@/components/network/cards/network-analysis-charts/StatisticsDateTimeNavigator';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import {StoreMixin} from '@/mixins/StoreMixin';
    import NetworkStatistics from '@stellarbeat/js-stellar-domain/lib/network-statistics';

    @Component({
        components: {AggregationLineChart, DateNavigator, BTooltip, BIconInfoCircle, BButton, BButtonGroup, BIconExclamationCircle}
    })
    export default class NetworkAnalysis extends Mixins(IsLoadingMixin, StoreMixin) {
        protected selectedDate!: Date;
        protected yearStatistics: NetworkStatisticsAggregation[] = [];
        protected days30Statistics: NetworkStatisticsAggregation[] = [];
        protected hour24Statistics: NetworkStatistics[] = [];
        protected initialDataLoaded: boolean = false;
        protected statisticsDateTimeNavigator!: StatisticsDateTimeNavigator;
        protected bucketSize: string = '1Y';
        protected failed: boolean = false;
        animated: boolean = false;

        @Prop()
        analysisType!:string; //safety of liveness

        get setType() {
            return this.analysisType === 'safety' ? 'splitting' : 'blocking';
        }

        async updateSelectedDate(newDate: Date) {
            this.selectedDate = newDate;
            if (this.bucketSize === '1Y')
                await this.updateYearChart();
            if (this.bucketSize === '30D')
                await this.updateDays30Chart();
            if (this.bucketSize === '24H')
                await this.updateHours24Chart();
        }

        async select1YView(time?: Date) {
            if (time instanceof Date)
                this.selectedDate = moment(time).startOf('hour').toDate();

            await this.updateYearChart();

            this.bucketSize = '1Y';
        }

        aggregatedChartLabelFilter(legendItem: ChartLegendLabelItem, data: ChartData): any {
            if (legendItem.datasetIndex === 0 || legendItem.datasetIndex === 3)
                return true; //don't show labels for the min max as they are auxiliary lines
        }

        getAggregatedDataSets(statisticsAggregation: NetworkStatisticsAggregation[]) {
            return [
                {
                    label: 'Organizations',
                    borderColor: 'rgba(25, 151, 198,1)', // primary blue
                    backgroundColor: 'rgba(25, 151, 198,0.6)', // primary blue
                    borderWidth: 2,
                    steppedLine: true,
                    fill: false,
                    type: 'line',
                    data: statisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetOrgsFilteredAverage"]
                        };
                    }),
                },
                {
                    label: 'min(|organizations|)',
                    borderWidth: 4,
                    borderColor: 'transparent', // primary blue
                    backgroundColor: 'rgba(25,151,198,0.4)',
                    steppedLine: true,
                    fill: '0', //relative to dataset with index zero
                    type: 'line',
                    data: statisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetOrgsFilteredMin"]
                        };
                    }),
                },
                {
                    label: 'max(|organizations|)',
                    borderWidth: 4,
                    borderColor: 'transparent', // primary blue
                    backgroundColor: 'rgba(25,151,198,0.4)',
                    steppedLine: true,
                    fill: '0',
                    type: 'line',
                    data: statisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetOrgsFilteredMax"]
                        };
                    }),
                },
                {
                    label: 'Nodes',
                    fill: false,
                    borderWidth: 2,
                    steppedLine: true,
                    type: 'line',
                    borderColor: 'rgba(27, 201, 142, 1)', // success green
                    backgroundColor: 'rgba(27, 201, 142, 1)', // success green
                    data: statisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetFilteredAverage"]
                        };
                    }),
                },
                {
                    label: 'min(|nodes|)',
                    fill: '3',
                    borderWidth: 4,
                    steppedLine: true,
                    type: 'line',
                    borderColor: 'transparent', // success green
                    backgroundColor: 'rgba(27, 201, 142, 0.6)', // success green
                    data: statisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetFilteredMin"]
                        };
                    }),
                },
                {
                    label: 'max(|nodes|)',
                    fill: '3',
                    borderWidth: 4,
                    steppedLine: true,
                    type: 'line',
                    borderColor: 'transparent', // success green
                    backgroundColor: 'rgba(27, 201, 142, 0.6)', // success green
                    data: statisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetFilteredMax"]
                        };
                    }),
                },
            ];
        }

        get day30ChartDataSets(): ChartDataSets[] {
            return this.getAggregatedDataSets(this.days30Statistics);
        }

        get yearChartDataSets(): ChartDataSets[] {
            return this.getAggregatedDataSets(this.yearStatistics);
        }

        get hour24ChartDataSets(): ChartDataSets[] {
            return [
                {
                    label: 'Organizations',
                    borderColor: 'rgba(25, 151, 198,1)', // primary blue
                    backgroundColor: 'rgba(25, 151, 198,0.6)', // primary blue
                    borderWidth: 2,
                    steppedLine: true,
                    fill: false,
                    type: 'line',
                    data: this.hour24Statistics.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetOrgsFilteredSize"]
                        };
                    }),
                },
                {
                    label: 'Nodes',
                    borderColor: 'rgba(27, 201, 142, 1)', // success green
                    backgroundColor: 'rgba(27, 201, 142, 1)', // success green
                    borderWidth: 2,
                    steppedLine: true,
                    fill: false,
                    type: 'line',
                    data: this.hour24Statistics.map(stat => {
                        return {
                            x: stat.time,
                            //@ts-ignore
                            y: stat["min" + this.capitalizeFirstLetter(this.setType) + "SetFilteredSize"]
                        };
                    }),
                },
            ];
        }

        getAggregatedLabels(tooltipItem: ChartTooltipItem, data: ChartData) {
            //@ts-ignore
            let orgAvg = data.datasets![0]!.data![tooltipItem.index!]!.y;
            //@ts-ignore
            let minOrg = data.datasets![1]!.data![tooltipItem.index!]!.y;
            //@ts-ignore
            let maxOrg = data.datasets![2]!.data![tooltipItem.index!]!.y;
            //@ts-ignore
            let nodeAvg = data.datasets![3]!.data![tooltipItem.index!]!.y;
            //@ts-ignore
            let minNode = data.datasets![4]!.data![tooltipItem.index!]!.y;
            //@ts-ignore
            let maxNode = data.datasets![5]!.data![tooltipItem.index!]!.y;

            let nodesDescription = '';
            if (minNode === maxNode)
                nodesDescription = nodeAvg;
            else
                nodesDescription = `${minNode} to ${maxNode}`;

            let orgDescription = '';
            if (minOrg === maxOrg)
                orgDescription = orgAvg;
            else
                orgDescription = `${minOrg} to ${maxOrg}`;

            //callback is triggered for every datasetIndex that is hoovered
            if ([1, 2].includes(tooltipItem.datasetIndex!)) {
                //hit on minimum or maximum organization
                if (minOrg === maxOrg)
                    return false; //we don't show the labels for min/max when they are the same
            }
            if ([4, 5].includes(tooltipItem.datasetIndex!)) {
                if (minNode === maxNode)
                    return false; //we don't show the labels for min/max when they are the same
            }

            return `set(s) of ${nodesDescription} nodes across ${orgDescription} top tier organizations found that could undermine ${this.analysisType}`;
        }

        getLabels(tooltipItem: ChartTooltipItem, data: ChartData) {
            //@ts-ignore
            let orgSize = data.datasets![0]!.data![tooltipItem.index!]!.y;
            //@ts-ignore
            let nodeSize = data.datasets![1]!.data![tooltipItem.index!]!.y;

            return `set(s) of ${nodeSize} nodes across ${orgSize} top tier organizations found that could undermine ${this.analysisType}`;
        }

        async select30DayView(time?: Date) {
            if (time instanceof Date)
                this.selectedDate = time;
            await this.updateDays30Chart();
            this.bucketSize = '30D';
        }

        async select24HView(time?: Date) {
            if (time instanceof Date)
                this.selectedDate = time;

            await this.updateHours24Chart();
            this.bucketSize = '24H';
        }

        async updateSelectedDateAndHighlight(newDate: Date) {
            console.log(newDate);
            await this.updateSelectedDate(newDate);
            console.log(this.animated);
            this.animated = true;
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

        async updateDays30Chart() {
            this.isLoading = true;
            let startOfDay = moment(this.selectedDate).startOf('day').toDate();
            let days30Ahead = moment(this.selectedDate).startOf('day').add(30, 'd').toDate();
            try {
                this.failed = false;
                this.days30Statistics = await this.store.networkMeasurementStore.getDayStatistics('stellar-public', startOfDay, days30Ahead);
            } catch (e) {
                this.failed = true;
            }
            this.isLoading = false;
        }

        async updateHours24Chart() {
            this.isLoading = true;
            let startOfDay = moment(this.selectedDate).startOf('day').toDate();
            let tomorrow = moment(this.selectedDate).startOf('day').add(1, 'd').toDate();
            try {
                this.failed = false;
                this.hour24Statistics = await this.store.networkMeasurementStore.getStatistics('stellar-public', startOfDay, tomorrow);
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

        protected capitalizeFirstLetter(myString:string) {
            return myString.charAt(0).toUpperCase() + myString.slice(1);
        }
    }
</script>

<style scoped>
    .canvas-container {
        height: 400px;
        width: 100%;
    }
</style>