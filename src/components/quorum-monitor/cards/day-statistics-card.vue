<template>
    <div class="card" style="">
        <div class="card-header">
            <h5 class="card-title">
                <h5 class="card-title">{{subject}}</h5>
            </h5>
        </div>
        <div class="card-body p-2">
            <div v-bind:class="dimmerClass">
                <div class="loader"></div>
                <div class="dimmer-content" ref="chartContainer">
                    <canvas v-if="renderChart" height="140px" :width="chartWidth" :id="'lineChart' + id" :ref="'lineChart' + id"></canvas>
                    <div class="date-selector d-flex">
                        <b-button :disabled="!canGoBack()" size="sm" v-on:click="goBack30Days()"><i
                                class="fe fe-chevron-left"></i></b-button>
                        <datepicker v-if="!isLoading" v-model="datePickerDate" :disabledDates="disabledDates"
                                    :bootstrap-styling="true"></datepicker>
                        <b-button size="sm" v-on:click="goForward30Days()"><i class="fe fe-chevron-right"></i>
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store, {DayStatistic, NodeDayStatistics} from '@/Store';
    import Datepicker from 'vuejs-datepicker';
    import moment from 'moment';
    import DayStatisticsChart from '@/components/quorum-monitor/statistics/day-statistics-chart.vue';
    import Chart from 'chart.js';

    @Component({
        name: 'day-statistics-card',
        components: {DayStatisticsChart, datepicker: Datepicker}
    })
    export default class DayStatisticsCard extends Vue {
        @Prop()
        subject!: string;
        @Prop()
        fetchDayStatistics!: Function;
        @Prop()
        entityId!: string;

        id: number = this.store.uniqueId;
        lineChart!: Chart;
        dayStatistics: DayStatistic[] = [];
        isLoading: boolean = true;
        selectedDate!: Date;
        datePickerDate: string | Date | null = null;
        disabledDates: any = {
            to: this.minSelectedDate,
            from: new Date()
        };
        renderChart: boolean = false;

        get minSelectedDate() {
            let minDate = new Date(this.store.measurementsStartDate.getTime());
            minDate.setDate(minDate.getDate() + 30);

            return minDate;
        }

        getInitialSelectedDate() {
            if (moment(this.store.crawlDate).subtract(30, 'd') < moment(this.store.measurementsStartDate)) {
                return moment(this.store.measurementsStartDate).add(30, 'd').toDate();
            } else
                return moment(this.store.crawlDate).toDate();
        }

        @Watch('entityId')
        public onEntityIdChanged() {
            this.updateStatistics();
        }

        @Watch('datePickerDate', {})
        async onDatePickerDateChanged(to: string, from: string) {
            if (this.datePickerDate && from !== null) { //don't trigger on first change
                this.selectedDate = new Date(this.datePickerDate);
                await this.updateStatistics();
                this.lineChart.data.datasets![0].data = this.positivePropertyPercentageData;
                this.lineChart.data.datasets![1].data = this.negativePropertyPercentageData;
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

        canGoBack() {
            return this.selectedDate > this.minSelectedDate;
        }

        async goBack30Days() {
            this.selectedDate.setDate(this.selectedDate.getDate() - 30);
            if (this.selectedDate < this.minSelectedDate) {
                this.selectedDate.setTime(this.minSelectedDate.getTime());
            }
            this.datePickerDate = this.selectedDate.toDateString();
            await this.updateStatistics();
            this.lineChart.data.datasets![0].data = this.positivePropertyPercentageData;
            this.lineChart.data.datasets![1].data = this.negativePropertyPercentageData;
            this.lineChart.update();
        }

        async goForward30Days() {
            this.selectedDate.setDate(this.selectedDate.getDate() + 30);
            this.datePickerDate = this.selectedDate.toDateString();
            await this.updateStatistics();
            this.lineChart.data.datasets![0].data = this.positivePropertyPercentageData;
            this.lineChart.data.datasets![1].data = this.negativePropertyPercentageData;
            this.lineChart.update();
        }

        async updateStatistics() {
            this.isLoading = true;
            let thirtyDaysAgo = new Date(this.selectedDate.getTime());
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
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
            this.datePickerDate = this.selectedDate.toDateString();
            await this.updateStatistics();
            this.renderChart = true;
            Vue.nextTick(() => {
                let chartId = 'lineChart' + this.id;
                let context = (this.$refs[chartId] as HTMLCanvasElement).getContext('2d');
                this.lineChart = new Chart(context as CanvasRenderingContext2D, {
                    type: 'bar',
                    data: {
                        datasets: [{
                            label: 'Validating',
                            backgroundColor: '#5eba00',
                            borderColor: '#1997c6',
                            data: this.positivePropertyPercentageData,
                            fill: 'origin'
                        },
                            {
                                label: 'Not Validating',
                                backgroundColor: 'red',
                                borderColor: '#1997c6',
                                data: this.negativePropertyPercentageData,
                                fill: 'origin'
                            }]
                    },

                    // Configuration options go here
                    options: {
                        tooltips: {
                            callbacks: {
                                label(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData): string | string[] {
                                    return ' ' + tooltipItem.value + '%';
                                }
                            },
                        },
                        responsive: false,
                        legend: {
                            display: false
                        },
                        animation: {
                            animateScale: true, // animate from small to large
                            animateRotate: false // animate clockwise
                        },
                        scales: {

                            scaleLabel: {
                                fontColor: '#f5f7fb',
                                fontSize: 3
                            },
                            xAxes: [{

                                stacked: true,
                                display: true,
                                type: 'time',
                                time: {
                                    unit: 'day',
                                    displayFormats: {
                                        day: 'D-M-YYYY'
                                    },
                                    tooltipFormat: 'D-M-YYYY'
                                },
                                distribution: 'series',
                                ticks: {
                                    fontColor: '#aaa',
                                    fontSize: 10,
                                }
                            }],
                            yAxes: [{
                                gridLines: {
                                    display: false
                                },
                                stacked: true,
                                display: true,
                                bounds: 'data',
                                ticks: {
                                    min: 0,
                                    max: 100,
                                    fontColor: '#aaa',
                                    fontSize: 10,
                                    beginAtZero: true,
                                    stepSize: 50,
                                    callback: function (value, index, values) {
                                        return value + '%';
                                    }
                                }
                            }]
                        }
                    }
                });
            });

        }
    }
</script>
<style scoped>
    .dimmer.active .dimmer-content {
        opacity: 0.4;
    }
</style>