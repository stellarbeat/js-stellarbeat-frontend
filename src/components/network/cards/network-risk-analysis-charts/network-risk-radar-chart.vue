<template>
    <div class="card" style="height: 320px" :class="dimmerClass">
        <div class="loader"></div>
        <div class="card-body d-flex flex-row justify-content-center p-1">
            <div class="canvas-container">
                <canvas :id="'networkRiskRadarChart' + id" :ref="'networkRiskRadarChart' + id"></canvas>
            </div>
        </div>
        <div class="m-2 mt-0 pt-0 pr-3 my-footer">
            <a v-show="!store.isNetworkAnalysisVisible" href="#"
               v-on:click.prevent.stop="store.isNetworkAnalysisVisible = true">Network Analysis</a>
        </div>
    </div>
</template>

<script lang="ts">
import Chart, {ChartData, ChartTooltipItem} from 'chart.js';

import Vue from 'vue';
import {Component, Watch} from 'vue-property-decorator';

import {Network} from '@stellarbeat/js-stellar-domain';
import Store from '@/store/Store';
import {BButton, BButtonGroup, BIconInfoCircle, BTooltip} from 'bootstrap-vue';
import DateNavigator from '@/components/date-navigator.vue';
import {AutomaticNetworkAnalysis} from '@/services/NetworkAnalyzer';

@Component({
    components: {DateNavigator, BTooltip, BIconInfoCircle, BButton, BButtonGroup}
})
export default class NetworkRiskRadarChart extends Vue {
    public chart!: Chart;

    id: number = this.store.getUniqueId();

    get store(): Store {
        return this.$root.$data.store;
    }

    get network(): Network {
        return this.store.network;
    }

    @Watch('store.networkAnalyzer.automaticState', {immediate: false})
    onStateChange() {
        if (this.store.networkAnalyzer.automaticState === AutomaticNetworkAnalysis.Done) {
            this.chart.data.datasets![0]!.data = [
                this.network.networkStatistics.minBlockingSetOrgsFilteredSize,
                this.network.networkStatistics.minBlockingSetFilteredSize,
                this.network.networkStatistics.minBlockingSetCountryFilteredSize,
                this.network.networkStatistics.minBlockingSetISPFilteredSize
            ];
            this.chart.data.datasets![1]!.data = [
                this.network.networkStatistics.minSplittingSetOrgsSize,
                this.network.networkStatistics.minSplittingSetSize,
                this.network.networkStatistics.minSplittingSetCountrySize,
                this.network.networkStatistics.minSplittingSetISPSize
            ];
            this.chart.update();
        }
    }

    get dimmerClass() {
        return {
            dimmer: true,
            active: this.store.networkAnalyzer.analyzing,
        };
    }

    public initializeChart() {
        let chartId = 'networkRiskRadarChart' + this.id;
        const context = this.$refs[chartId];
        let that = this;
        this.chart = new Chart(context as HTMLCanvasElement, {
            type: 'radar',
            data: {
                labels: [
                    'Organization',
                    'Node',
                    'Country',
                    'ISP'
                ],
                datasets: [
                    {
                        label: 'Liveness',
                        data: [
                            this.network.networkStatistics.minBlockingSetOrgsFilteredSize,
                            this.network.networkStatistics.minBlockingSetFilteredSize,
                            this.network.networkStatistics.minBlockingSetCountryFilteredSize,
                            this.network.networkStatistics.minBlockingSetISPFilteredSize
                        ],
                        fill: true,
                        borderColor: 'rgba(25, 151, 198,1)',
                        backgroundColor: 'rgba(25, 151, 198, 0.1)',
                    },
                    {
                        label: 'Safety',
                        data: [
                            this.network.networkStatistics.minSplittingSetOrgsSize,
                            this.network.networkStatistics.minSplittingSetSize,
                            this.network.networkStatistics.minSplittingSetCountrySize,
                            this.network.networkStatistics.minSplittingSetISPSize
                        ],
                        fill: true,
                        borderColor: 'rgb(159, 134, 255)',
                        backgroundColor: 'rgba(159, 134, 255, 0.1)',
                    }
                ]
            },

            // Configuration options go here
            options: {
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        bottom: 0,
                        top: 10
                    }
                },
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: "top"
                },
                animation: {
                    duration: 0 // general animation time
                },
                tooltips: {
                    callbacks: {
                        title: function (tooltipItem, data) {
                            const id = tooltipItem[0].index;
                            return data.labels![id!] as string;
                        },
                        label: (tooltipItem: ChartTooltipItem, data: ChartData) => {
                            //@ts-ignore
                            let size = data.datasets![tooltipItem.datasetIndex]!.data![tooltipItem.index!]!;
                            let type = tooltipItem.datasetIndex === 0 ? 'liveness' : 'safety';
                            return `Set of size ${size} found that could impact ${type}`;
                        }
                    }
                },
                scale:
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }

            },
        });
    }

    public async mounted() {
        this.initializeChart();
    }

    public beforeDestroy() {
        if (this.chart) {
            this.chart.destroy();
        }
    }
}
</script>

<style scoped>
.my-footer {
    text-align: right;
}
</style>