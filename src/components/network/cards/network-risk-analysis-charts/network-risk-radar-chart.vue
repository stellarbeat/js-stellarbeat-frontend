<template>
    <div class="card" style="height: 320px" :class="dimmerClass">
        <div class="mx-4 mt-4 my-header">
            <div class="text-muted">
                Network analysis
            </div>
            <b-button size="sm" class="info" @click="showModal=true">
                <b-icon-info-circle v-b-tooltip:hover.top="'Info'"
                                    class="text-muted"/>
            </b-button>
        </div>
        <div class="loader"></div>
        <div class="card-body d-flex flex-row justify-content-center p-1 my-body">
            <div class="canvas-container">
                <canvas :id="'networkRiskRadarChart' + id" :ref="'networkRiskRadarChart' + id"></canvas>
            </div>
        </div>

        <b-modal lazy title="Info" ok-only hide-header v-model="showModal">
            <h3>What does this chart show?</h3>
            <p class="my-4">
                This chart shows liveness and safety buffers for the whole network. For example if the node liveness
                data point shows that a set of two nodes is found, this means that two specific nodes could halt the
                network if they fail. If you want to find out what these nodes are, click on a datapoint and run the network analysis.
            </p>
            <template v-slot:modal-footer>
                <div class="w-100">
                    <p class="float-left">Powered by <a target="_blank" rel="noopener"
                                                        href="https://github.com/wiberlin/fbas_analyzer">wiberlin/fbas_analyzer</a>
                    </p>
                    <b-button
                        variant="primary"
                        size="sm"
                        class="float-right"
                        @click="showModal = false"
                    >
                        Close
                    </b-button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script lang="ts">
import Chart, {ChartData, ChartTooltipItem} from 'chart.js';

import Vue from 'vue';
import {Component, Watch} from 'vue-property-decorator';

import {Network} from '@stellarbeat/js-stellar-domain';
import Store from '@/store/Store';
import {BButton, BButtonGroup, BIconGear, BIconInfoCircle, BModal, BTooltip} from 'bootstrap-vue';
import DateNavigator from '@/components/date-navigator.vue';
import {AutomaticNetworkAnalysis} from '@/services/NetworkAnalyzer';
import {MergeBy} from 'stellar_analysis';

@Component({
    components: {DateNavigator, BModal, BTooltip, BIconInfoCircle, BButton, BButtonGroup, BIconGear}
})
export default class NetworkRiskRadarChart extends Vue {
    public chart!: Chart;
    protected showModal: boolean = false;

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
                onHover(event: MouseEvent, activeElements: Array<{}>): any {
                    (event.target! as any).style.cursor = activeElements[0] ? 'pointer' : 'default';
                },
                onClick(event?: MouseEvent, activeElements?: Array<{}>): any {
                    if (activeElements && activeElements[0] && Number((activeElements[0] as any)._index) >= 0) {
                        switch ((activeElements[0] as any)._index) {
                            case 0: that.store.networkAnalysisMergeBy = MergeBy.Orgs; break;
                            case 1: that.store.networkAnalysisMergeBy = MergeBy.DoNotMerge; break;
                            case 2: that.store.networkAnalysisMergeBy = MergeBy.Countries; break;
                            case 3: that.store.networkAnalysisMergeBy = MergeBy.ISPs; break;
                        }
                        if (!that.store.isNetworkAnalysisVisible)
                            that.store.isNetworkAnalysisVisible = true;
                        else
                            that.$nextTick(() => {
                                that.$scrollTo('#network-analysis-card');
                            });
                    }
                },
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
                    position: 'bottom'
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
.my-header {
    display: flex;
    justify-content: space-between;
}

.info {
}

.my-body {
}

.info-container {
    margin-left: auto;
    position: relative;
}
</style>