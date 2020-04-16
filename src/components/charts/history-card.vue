<template>
    <div class="card" style="">
        <div class="card-header pl-3 d-flex flex-wrap">
            <b-button-group size="sm" class="mr-3">
                <b-button :pressed="chartView === '30D'" @click="select30DayView">30D</b-button>
                <b-button :pressed="chartView === '24H'" @click="select24HView">24H</b-button>
                <b-button :pressed="chartView === '1H'" @click="select1HView">1H</b-button>
            </b-button-group>
            <h5 class="card-title">
                {{subject}}
            </h5>
        </div>
        <div v-if="failed" class="card-alert alert alert-danger mb-0">
            <i class="fe fe-alert-triangle"></i>
            Error fetching data
        </div>
        <div class="card-body p-2">
            <div v-bind:class="dimmerClass">
                <div class="loader"></div>
                <div class="dimmer-content" ref="chartContainer">
                    <div v-if="rendered">
                        <ThirtyDayBarChart
                                v-if="chartView === '30D'"
                                v-on:click-date="select24HView"
                                :width="chartWidth"
                                :data="thirtyDaysBarChartData"
                                :unit="'day'"
                                :ref="'thirty-day-chart'"
                                :key="'1'"
                        />
                        <TwentyFourHourBarChart
                                v-on:click-date="select1HView"
                                v-if="chartView === '24H'"
                                :width="chartWidth"
                                :data="twentyFourHourBarChartData"
                                :unit="'hour'"
                                :key="'2'"
                        />
                        <line-chart-hour
                                v-on:click-date="updateSelectedDateAndHighlight"
                                v-if="chartView === '1H'"
                                v-on:update-view="updateView"
                                :width="chartWidth"
                                :data="oneHourLineChartData"
                                :inverted="inverted"
                        />
                    </div>

                    <div class="d-flex flex-wrap mt-1" :class="{'animated': animated}" @animationend="animated = false">
                        <date-navigator
                                v-if="rendered"
                                :minSelectedDate="minSelectedDate"
                                :selectedDate="selectedDate"
                                v-on:dateChanged="updateSelectedDate"
                                v-on:goBack="goBack30Days"
                                v-on:goForward="goForward30Days"
                                :showTime="chartView === '1H'"
                                class="mr-1 mb-1"
                        >
                        </date-navigator>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import moment from 'moment';
    import DateNavigator from '@/components/date-navigator.vue';
    import BarChartDay from '@/components/charts/bar-chart-day.vue';
    import LineChartHour from '@/components/charts/line-chart-hour.vue';
    import {DayMeasurement, Measurement} from '@/store/MeasurementStore';

    @Component({
        name: 'history-card',
        components: {
            LineChartHour,
            DateNavigator,
            ThirtyDayBarChart: BarChartDay,
            TwentyFourHourBarChart: BarChartDay,
        }
    })
    export default class HistoryCard extends Vue {
        @Prop()
        subject!: string;
        @Prop()
        fetchDayMeasurements!: Function;
        @Prop()
        fetchMeasurements!: Function;
        @Prop()
        dayMeasurementProperty!: string;
        @Prop()
        measurementProperty!: string;
        @Prop()
        entityId!: string;
        @Prop({default: false})
        inverted!: boolean;

        thirtyDayMeasurements: DayMeasurement[] = [];
        twentyFourHourMeasurements: Measurement[] = [];

        isLoading: boolean = true;
        rendered: boolean = false;
        selectedDate!: Date;
        failed: boolean = false;
        chartView: string = '30D';
        animated: boolean = false;

        async select30DayView(time?: Date) {
            if (time instanceof Date)
                this.selectedDate = time;

            await this.updateDayHistoryChart();
            this.chartView = '30D';
        }

        async timeTravel() {
            this.store.isLoading = true;
            await this.store.fetchData(this.selectedDate);
            this.store.isLoading = false;
        }

        async select24HView(time?: Date) {
            if (time instanceof Date)
                this.selectedDate = moment(time).startOf('day').toDate();

            await this.update24HourHistoryChart();
            this.chartView = '24H';
        }

        async select1HView(time?: Date) {
            if (time instanceof Date)
                this.selectedDate = moment(time).startOf('hour').toDate();

            await this.update24HourHistoryChart();

            this.chartView = '1H';
        }

        updateView(view: string) {
            this.chartView = view;
        }

        async updateSelectedDate(newDate: string) {
            this.selectedDate = new Date(newDate);
            if (this.chartView === '30D')
                await this.updateDayHistoryChart();
            else
                await this.update24HourHistoryChart();
        }

        async updateSelectedDateAndHighlight(newDate: string) {
            this.updateSelectedDate(newDate);
            this.animated = true;
        }

        @Watch('entityId')
        async onEntityIdChanged() {
            if (this.chartView === '30D')
                await this.updateDayHistoryChart();
            else
                await this.update24HourHistoryChart();
        }

        getInitialSelectedDate() {
            if (moment(this.store.network.crawlDate).subtract(30, 'd') < moment(this.store.measurementsStartDate)) {
                return moment(this.store.measurementsStartDate).add(30, 'd').startOf('day').toDate();
            } else
                return moment(this.store.network.crawlDate).startOf('day').toDate();
        }

        get chartWidth() {
            return (this.$refs.chartContainer as HTMLDivElement).clientWidth;
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get dimmerClass() {
            return {
                dimmer: true,
                active: this.isLoading,
            };
        }

        get minSelectedDate() {
            return moment(this.store.measurementsStartDate).add(30, 'd').toDate();
        }

        async goBack30Days() {
            if (this.chartView === '30D')
                this.selectedDate = moment(this.selectedDate).subtract(30, 'd').toDate();
            else if (this.chartView === '24H')
                this.selectedDate = moment(this.selectedDate).subtract(1, 'd').toDate();
            else if (this.chartView === '1H')
                this.selectedDate = moment(this.selectedDate).subtract(1, 'h').toDate();

            if (this.selectedDate < this.minSelectedDate) {
                this.selectedDate.setTime(this.minSelectedDate.getTime());
            }

            if (this.chartView === '30D')
                await this.updateDayHistoryChart();
            else
                await this.update24HourHistoryChart();

        }

        async goForward30Days() {
            if (this.chartView === '30D')
                this.selectedDate = moment(this.selectedDate).add(30, 'd').toDate();
            else if (this.chartView === '24H')
                this.selectedDate = moment(this.selectedDate).add(1, 'd').toDate();
            else if (this.chartView === '1H')
                this.selectedDate = moment(this.selectedDate).add(1, 'h').toDate();

            if (this.chartView === '30D')
                await this.updateDayHistoryChart();
            else
                await this.update24HourHistoryChart();

        }

        async updateDayHistoryChart() {
            this.isLoading = true;
            let thirtyDaysAgo = moment(this.selectedDate).subtract(29, 'd').toDate();
            try {
                this.failed = false;
                this.thirtyDayMeasurements = await this.fetchDayMeasurements(this.entityId, thirtyDaysAgo, moment(this.selectedDate).add(1, 'day').startOf('day').toDate());
            } catch (e) {
                this.failed = true;
            }
            this.isLoading = false;
        }

        async update24HourHistoryChart() {
            this.isLoading = true;
            let tomorrow = moment(this.selectedDate).startOf('day').add(1, 'd').toDate();
            try {
                this.failed = false;
                this.twentyFourHourMeasurements = await this.fetchMeasurements(this.entityId, moment(this.selectedDate).startOf('day').toDate(), tomorrow);
            } catch (e) {
                this.failed = true;
            }
            this.isLoading = false;
        }


        get thirtyDaysBarChartData(): { t: Date, y: number }[] {
            return this.thirtyDayMeasurements.map((measurement: any) => {
                if (!this.inverted) {
                    return {
                        t: measurement.day as Date,
                        y: Number(((measurement[this.dayMeasurementProperty] / measurement.crawlCount) * 100).toFixed(2))
                    };
                } else {
                    return {
                        t: measurement.day as Date,
                        y: Number((((measurement.crawlCount - measurement[this.dayMeasurementProperty]) / measurement.crawlCount) * 100).toFixed(2))
                    };
                }
            });
        }

        get twentyFourHourBarChartData(): { t: Date, y: number }[] {
            let twentyFourHourMap = new Map<string, number[]>();
            this.twentyFourHourMeasurements.forEach((measurement: any) => {
                let hourBucketString = moment(measurement.time).startOf('hour').toISOString();
                if (!twentyFourHourMap.get(hourBucketString))
                    twentyFourHourMap.set(hourBucketString, []);
                twentyFourHourMap.get(hourBucketString)!.push(measurement[this.measurementProperty]);
            });

            let twentyFourHourAverages: { t: Date, y: number }[] = [];
            twentyFourHourMap.forEach((measurements, hourString) => {
                if (this.inverted) {
                    twentyFourHourAverages.push({
                        t: new Date(hourString),
                        y: Number((100 - (measurements.reduce((a, b) => a + b, 0) / measurements.length) * 100).toFixed(2))
                    });
                } else {
                    twentyFourHourAverages.push({
                        t: new Date(hourString),
                        y: Number(((measurements.reduce((a, b) => a + b, 0) / measurements.length) * 100).toFixed(2))
                    });
                }
            });

            return twentyFourHourAverages;
        }

        get oneHourLineChartData(): { t: Date, y: number }[] {
            return this.twentyFourHourMeasurements
                .filter(measurement => measurement.time.getHours() === moment(this.selectedDate).add(0, 'hour').toDate().getHours())
                .map((measurement: any) => {
                    if (!this.inverted) {
                        return {
                            t: measurement.time as Date,
                            y: measurement[this.measurementProperty]
                        };
                    } else {
                        return {
                            t: measurement.time as Date,
                            y: measurement[this.measurementProperty]
                        };
                    }
                });
        }

        async mounted() {
            this.selectedDate = this.getInitialSelectedDate();
            await this.updateDayHistoryChart();
            this.rendered = true;
        }
    }
</script>
<style scoped>
    .dimmer.active .dimmer-content {
        opacity: 0.4;
    }
</style>