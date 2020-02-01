<template>
    <div class="card" style="">
        <div class="card-header">
            <h5 class="card-title">
                {{subject}}
            </h5>
        </div>
        <div class="card-body p-2">
            <div v-bind:class="dimmerClass">
                <div class="loader"></div>
                <div class="dimmer-content" ref="chartContainer">
                    <bar-chart-day
                            v-if="rendered"
                            :width="chartWidth"
                            :data="barChartData"
                    />
                    <date-navigator
                            v-if="rendered"
                            :minSelectedDate="minSelectedDate"
                            :selectedDate="selectedDate"
                            v-on:dateChanged="updateSelectedDate"
                            v-on:goBack="goBack30Days"
                            v-on:goForward="goForward30Days"
                    >
                    </date-navigator>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store, {DayStatistic} from '@/Store';
    import moment from 'moment';
    import DayStatisticsChart from '@/components/quorum-monitor/statistics/day-statistics-chart.vue';
    import DateNavigator from '@/components/date-navigator.vue';
    import BarChartDay from '@/components/quorum-monitor/bar-chart-day.vue';

    interface BarChartDayData {
        positivePropertyPercentageData: any;
        negativePropertyPercentageData: any;
    }

    @Component({
        name: 'day-statistics-card',
        components: {DayStatisticsChart, DateNavigator, BarChartDay}
    })
    export default class DayStatisticsCard extends Vue {
        @Prop()
        subject!: string;
        @Prop()
        fetchDayStatistics!: Function;
        @Prop()
        entityId!: string;

        dayStatistics: DayStatistic[] = [];
        isLoading: boolean = true;
        rendered: boolean = false;
        selectedDate!: Date;

        async updateSelectedDate(newDate: string) {
            this.selectedDate = new Date(newDate);
            await this.updateChartStatistics();
        }

        @Watch('entityId')
        async onEntityIdChanged() {
            await this.updateChartStatistics();
        }

        getInitialSelectedDate() {
            if (moment(this.store.crawlDate).subtract(30, 'd') < moment(this.store.measurementsStartDate)) {
                return moment(this.store.measurementsStartDate).add(30, 'd').toDate();
            } else
                return moment(this.store.crawlDate).toDate();
        }

        get barChartData():BarChartDayData {
            return {
                negativePropertyPercentageData: this.negativePropertyPercentageData,
                positivePropertyPercentageData: this.positivePropertyPercentageData
            }
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
            this.selectedDate = moment(this.selectedDate).subtract(30, 'd').toDate();
            if (this.selectedDate < this.minSelectedDate) {
                this.selectedDate.setTime(this.minSelectedDate.getTime());
            }
            await this.updateChartStatistics();
        }

        async goForward30Days() {
            this.selectedDate = moment(this.selectedDate).add(30, 'd').toDate();
            await this.updateChartStatistics();
        }

        async updateChartStatistics() {
            await this.fetchStatistics();
        }

        async fetchStatistics() {
            this.isLoading = true;
            let thirtyDaysAgo = moment(this.selectedDate).subtract(30,'d').toDate();
            this.dayStatistics = await this.fetchDayStatistics(this.entityId, thirtyDaysAgo, this.selectedDate);
            this.isLoading = false;
        }

        get positivePropertyPercentageData() {
            return this.dayStatistics.map(stat => {
                return {
                    t: new Date(stat.day),
                    y: ((stat.propertyCount / stat.crawlCount) * 100).toFixed(2)
                };
            });
        }

        get negativePropertyPercentageData() {
            return this.dayStatistics.map(stat => {
                return {
                    t: new Date(stat.day),
                    y: (100 - (stat.propertyCount / stat.crawlCount) * 100).toFixed(2)
                };
            });
        }

        async mounted() {
            this.selectedDate = this.getInitialSelectedDate();
            await this.fetchStatistics();
            this.rendered = true;
        }
    }
</script>
<style scoped>
    .dimmer.active .dimmer-content {
        opacity: 0.4;
    }
</style>