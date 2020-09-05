<template>
    <div class="w-100 h-100">
        <canvas id="charty" ref="charty"></canvas>
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
    export default class LivenessAggregationLineChart extends Vue {
        public chart!: Chart;

        @Prop()
        protected networkStatisticsAggregation!: NetworkStatisticsAggregation[];

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get chartData() {
            if (!this.networkStatisticsAggregation)
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
                    data: this.networkStatisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            y: stat.minBlockingSetOrgsFilteredAverage
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
                    data: this.networkStatisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            y: stat.minBlockingSetOrgsFilteredMin
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
                    data: this.networkStatisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            y: stat.minBlockingSetOrgsFilteredMax
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
                    data: this.networkStatisticsAggregation.map(stats => {
                        return {
                            x: stats.time,
                            y: stats.minBlockingSetFilteredAverage
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
                    data: this.networkStatisticsAggregation.map(stats => {
                        return {
                            x: stats.time,
                            y: stats.minBlockingSetFilteredMin
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
                    data: this.networkStatisticsAggregation.map(stat => {
                        return {
                            x: stat.time,
                            y: stat.minBlockingSetFilteredMax
                        };
                    }),
                },
            ];
        }

        @Watch('networkStatisticsAggregation')
        onNetworkStatisticsAggregationChanged() {
            this.chart.data.datasets = this.chartData;
            this.chart.update();
        }


        public initializeBarChart() {
            const context = this.$refs.charty;
            let that = this;
            this.chart = new Chart(context as HTMLCanvasElement, {
                type: 'line',
                // The data for our dataset
                data: {
                    datasets: this.chartData,
                },

                // Configuration options go here
                options: {
                    onHover(event: MouseEvent, activeElements: Array<{}>): any {
                        (event.target! as any).style.cursor = activeElements[0] ? 'pointer' : 'default';
                    },
                    /*onClick(event?: MouseEvent, activeElements?: Array<{}>): any {
                        if (activeElements && activeElements[0] && Number((activeElements[0] as any)._index) >= 0) {
                            that.$emit('click-date', that.barChartDataSets[Number((activeElements[0] as any)._index)].t);
                        }
                    },*/
                    tooltips: {
                        intersect: false,
                        callbacks: {
                            //@ts-ignore
                            label: function (tooltipItem, data) {
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
                                if(minNode === maxNode)
                                    nodesDescription = nodeAvg;
                                else
                                    nodesDescription = `${minNode} to ${maxNode}`;

                                let orgDescription = '';
                                if(minOrg === maxOrg)
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

                                return `set(s) of ${nodesDescription} nodes across ${orgDescription} organizations found that could undermine liveness`;
                            }
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
                        display: false
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            filter: (legendItem, chartData) => {
                                if (legendItem.datasetIndex === 0 || legendItem.datasetIndex === 3)
                                    return true; //don't show labels for the min max as they are auxiliary lines
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
                                stepSize: 1,
                                tooltipFormat: 'MMM YYYY'
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