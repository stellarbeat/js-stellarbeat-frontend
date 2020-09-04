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
        <div class="card-body d-flex flex-column justify-content-center align-items-center h-100">
            <div class="canvas-container">
                <canvas id="sumOfPartsChart" ref="sumOfPartsChart"></canvas>
            </div>
            <date-navigator
                    :selected-date="new Date()"
                    class="mr-1 mb-1"
            >
            </date-navigator>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js';

    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import {BTooltip, BIconInfoCircle, BButton, BButtonGroup} from 'bootstrap-vue';
    import DateNavigator from '@/components/date-navigator.vue';
    import moment from 'moment';
    import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';

    @Component({
        components: {DateNavigator, BTooltip, BIconInfoCircle, BButton, BButtonGroup}
    })
    export default class OrganizationNetworkAnalysis extends Vue {
        public chart: Chart | null = null;
        protected selectedDate!: Date;
        protected yearMeasurements?: NetworkStatisticsAggregation[];
        protected loading: boolean = true;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get barChartDataSets() {
            if(!this.yearMeasurements)
                return [];
            return [
                {
                    label: 'Organizations',
                    borderColor: 'rgba(25, 151, 198,1)', // primary blue
                    backgroundColor: 'rgba(25, 151, 198,0.6)', // primary blue
                    borderWidth: 2,
                    steppedLine: true,
                    fill: false,
                    type: 'line',
                    data: this.yearMeasurements.map(measurement => {
                        console.log(measurement.minBlockingSetOrgsFilteredMax);
                        return {
                            //@ts-ignore todo: fix in data model
                            x: measurement.month,
                            y: Math.round((measurement.minBlockingSetOrgsFilteredMax + measurement.minBlockingSetOrgsFilteredMin) / 2)
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
                    data: this.yearMeasurements.map(measurement => {
                        return {
                            //@ts-ignore todo: fix in data model
                            x: measurement.month,
                            y: measurement.minBlockingSetOrgsFilteredMin
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
                    data: this.yearMeasurements.map(measurement => {
                        return {
                            //@ts-ignore todo: fix in data model
                            x: measurement.month,
                            y: measurement.minBlockingSetOrgsFilteredMax
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
                    data: this.yearMeasurements.map(measurement => {
                        return {
                            //@ts-ignore todo: fix in data model
                            x: measurement.month,
                            y: Math.round((measurement.minBlockingSetFilteredMax + measurement.minBlockingSetFilteredMin) / 2)
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
                    data: this.yearMeasurements.map(measurement => {
                        return {
                            //@ts-ignore todo: fix in data model
                            x: measurement.month,
                            y: measurement.minBlockingSetOrgsFilteredMin
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
                    data: this.yearMeasurements.map(measurement => {
                        return {
                            //@ts-ignore todo: fix in data model
                            x: measurement.month,
                            y: measurement.minBlockingSetOrgsFilteredMax
                        };
                    }),
                },
            ];
        }


        public initializeBarChart() {
            const context = this.$refs.sumOfPartsChart;
            this.chart = new Chart(context as HTMLCanvasElement, {
                type: 'bar',
                // The data for our dataset
                data: {
                    datasets: this.barChartDataSets,
                },

                // Configuration options go here
                options: {
                    tooltips: {
                        callbacks: {
                            //@ts-ignore
                            /*label: function (tooltipItem, data) {
                                if ([1, 2].includes(tooltipItem.datasetIndex!)) {
                                    //@ts-ignore
                                    if (data.datasets![1]!.data![tooltipItem.index!]!.y === data.datasets![2]!.data![tooltipItem.index!]!.y)
                                        return false;
                                    else
                                        //@ts-ignore
                                        return `set(s) of ${data.datasets![4]!.data![tooltipItem.index!]!.y} to ${data.datasets![5]!.data![tooltipItem.index!]!.y} nodes spread over ${data.datasets![1]!.data![tooltipItem.index!]!.y} to ${data.datasets![2]!.data![tooltipItem.index!]!.y} organizations found that could undermine liveness`;
                                }
                                if ([4, 5].includes(tooltipItem.datasetIndex!)) {
                                    //@ts-ignore
                                    if (data.datasets![4]!.data![tooltipItem.index!]!.y === data.datasets![5]!.data![tooltipItem.index!]!.y)
                                        return false;
                                    else
                                        //@ts-ignore
                                        return `set(s) of ${data.datasets![4]!.data![tooltipItem.index!]!.y} to ${data.datasets![5]!.data![tooltipItem.index!]!.y} nodes spread over ${data.datasets![1]!.data![tooltipItem.index!]!.y} to ${data.datasets![2]!.data![tooltipItem.index!]!.y} organizations found that could undermine liveness`;
                                }

                                if ([0].includes(tooltipItem.datasetIndex!)) {
                                    //@ts-ignore
                                    if (data.datasets![1]!.data![tooltipItem.index!]!.y === data.datasets![2]!.data![tooltipItem.index!]!.y)
                                        //@ts-ignore
                                        return `set(s) of ${data.datasets![3]!.data![tooltipItem.index!]!.y} nodes spread over ${data.datasets![0]!.data![tooltipItem.index!]!.y} organizations found that could undermine liveness`;
                                    else
                                        //@ts-ignore
                                        return `set(s) of ${data.datasets![4]!.data![tooltipItem.index!]!.y} to ${data.datasets![5]!.data![tooltipItem.index!]!.y} nodes spread over ${data.datasets![1]!.data![tooltipItem.index!]!.y} to ${data.datasets![2]!.data![tooltipItem.index!]!.y} organizations found that could undermine liveness`;
                                }
                                if ([3].includes(tooltipItem.datasetIndex!)) {
                                    //@ts-ignore
                                    if (data.datasets![1]!.data![tooltipItem.index!]!.y === data.datasets![2]!.data![tooltipItem.index!]!.y)
                                        //@ts-ignore
                                        return `set(s) of ${data.datasets![3]!.data![tooltipItem.index!]!.y} nodes spread over ${data.datasets![0]!.data![tooltipItem.index!]!.y} organizations found that could undermine liveness`;
                                    else
                                        //@ts-ignore
                                        return `set(s) of ${data.datasets![4]!.data![tooltipItem.index!]!.y} to ${data.datasets![5]!.data![tooltipItem.index!]!.y} nodes spread over ${data.datasets![1]!.data![tooltipItem.index!]!.y} to ${data.datasets![2]!.data![tooltipItem.index!]!.y} organizations found that could undermine liveness`;
                                }
                            }*/
                        }
                    },
                    plugins: {
                        filler: {
                            propagate: true
                        }
                    },
                    elements: {
                        point: {
                            radius: 0,
                            hitRadius: 5,
                            hoverRadius: 5
                        }
                    },
                    layout: {

                        padding: {
                            left: 20,
                            right: 20
                        }
                    },
                    title: {
                        text: 'Sum of Parts',
                        display: false,
                        fontSize: 20
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            filter: (legendItem, chartData) => {
                                if (legendItem.datasetIndex === 0 || legendItem.datasetIndex === 3)
                                    return true;
                                // return true or false based on legendItem's datasetIndex (legendItem.datasetIndex)
                            }
                        }

                    },
                    animation: {
                        duration: 0 // general animation time
                    },
                    scales: {
                        xAxes: [{
                            offset: false,
                            type: 'time',
                            time: {
                                unit: 'month',
                                stepSize: 1
                            },
                            gridLines: {
                                offsetGridLines: true,
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                },
            });
        }

        public async mounted() {
            let oneYearAgo = moment(this.selectedDate).subtract(1, 'y').toDate();
            this.yearMeasurements = await this.store.networkMeasurementStore.getMonthMeasurements('stellar-public', oneYearAgo, new Date());
            this.loading = false;
            console.log(this.yearMeasurements);
            console.log(this.barChartDataSets);
            this.initializeBarChart();
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