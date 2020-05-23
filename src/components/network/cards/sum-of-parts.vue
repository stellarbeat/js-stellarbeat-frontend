<template>
    <div class="card ">
        <!--div class="card-header">
            <h3 class="card-title">Validator loads </h3>
            <b-icon-info-circle class="ml-2 mt-0 text-muted" id="overLoadedTooltip"/>
            <b-tooltip target="overLoadedTooltip" placement="top">
                A validator has a high load when it disconnects due to 'high load' most of the time during the last 30 days.
            </b-tooltip>
        </div!-->
        <div class="card-header pl-3 d-flex flex-wrap">
            <b-button-group size="sm" class="mr-3">
                <b-button :pressed="chartView === '1Y'" @click="select30DayView">1Y</b-button>
                <b-button :pressed="chartView === '30D'" @click="select30DayView">30D</b-button>
                <b-button :pressed="chartView === '24H'" @click="select24HView">24H</b-button>
                <b-button :pressed="chartView === '1H'" @click="select1HView">1H</b-button>
            </b-button-group>
            <h1 class="card-title">Sum of parts</h1>
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

    @Component({
        components: {DateNavigator, BTooltip, BIconInfoCircle, BButton, BButtonGroup}
    })
    export default class SumOfParts extends Vue {
        public chart: Chart | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get barChartDataSets() {
            return [{
                label: 'Min block sets',
                borderColor: 'rgba(25, 151, 198,1)', // primary blue
                fill: false,
                data: [{x: '2019-01-01', y: 2},
                    {x: '2019-02-01', y: 2},
                    {x: '2019-03-01', y: 2},
                    {x: '2019-04-01', y: 2},
                    {x: '2019-05-01', y: 2},
                    {x: '2019-06-01', y: 2},
                    {x: '2019-07-01', y: 2},
                    {x: '2019-08-01', y: 2},
                    {x: '2019-09-01', y: 2},
                    {x: '2019-10-01', y: 2},
                    {x: '2019-11-01', y: 2},
                    {x: '2019-12-01', y: 2}],
            },
                {
                    label: 'Min split sets',
                    fill: false,

                    borderColor: '#1bc98e', // success green
                    data: [{x: '2019-01-01', y: 4},
                        {x: '2019-02-01', y: 4},
                        {x: '2019-03-01', y: 4},
                        {x: '2019-04-01', y: 4},
                        {x: '2019-05-01', y: 3},
                        {x: '2019-06-01', y: 4},
                        {x: '2019-07-01', y: 4},
                        {x: '2019-08-01', y: 4},
                        {x: '2019-09-01', y: 4},
                        {x: '2019-10-01', y: 4},
                        {x: '2019-11-01', y: 4},
                        {x: '2019-12-01', y: 4}]
                },
                {
                    label: 'Top tier size',
                    fill: false,

                    borderColor: '#e4d836', // warning yellow,
                    data: [{x: '2019-01-01', y: 7},
                        {x: '2019-02-01', y: 7},
                        {x: '2019-03-01', y: 7},
                        {x: '2019-04-01', y: 6},
                        {x: '2019-05-01', y: 7},
                        {x: '2019-06-01', y: 7},
                        {x: '2019-07-01', y: 7},
                        {x: '2019-08-01', y: 7},
                        {x: '2019-09-01', y: 7},
                        {x: '2019-10-01', y: 7},
                        {x: '2019-11-01', y: 7},
                        {x: '2019-12-01', y: 7}]
                }];
        }

        public initializeBarChart() {
            const context = this.$refs.sumOfPartsChart;
            this.chart = new Chart(context as HTMLCanvasElement, {
                type: 'line',
                // The data for our dataset
                data: {
                    datasets: this.barChartDataSets,
                },

                // Configuration options go here
                options: {
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
                    },
                    animation: {
                        duration: 0 // general animation time
                    },
                    scales: {
                        xAxes: [{
                            offset: false,
                            type: 'time',
                            time: {
                                unit: 'month'
                            },
                            gridLines: {
                                offsetGridLines: true
                            }
                        }],
                        yAxes: [{
                            ticks:{
                                beginAtZero: true
                            }
                        }]
                    }
                },
            });
        }

        public mounted() {
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
        height: 250px;
        width: 100%;
    }
</style>