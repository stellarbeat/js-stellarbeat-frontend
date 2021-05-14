<template>
    <div class="card" style="height: 320px">
        <div class="text-muted mx-3 mt-3">
            Current liveness risk
        </div>
        <div class="card-body d-flex flex-row justify-content-center p-1">
            <div class="canvas-container">
                <canvas :id="'livenessRadarChart' + id" :ref="'livenessRadarChart' + id"></canvas>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart, {ChartDataSets} from 'chart.js';

    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import {BTooltip, BIconInfoCircle, BButton, BButtonGroup} from 'bootstrap-vue';
    import DateNavigator from '@/components/date-navigator.vue';

    @Component({
        components: {DateNavigator, BTooltip, BIconInfoCircle, BButton, BButtonGroup}
    })
    export default class LivenessRadarChart extends Vue {
        public chart!: Chart;

        id: number = this.store.getUniqueId();

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        @Watch("store.networkAnalyzer.livenessAnalyzed", {immediate: false})
        onLivenessChange(){
            this.chart.data.datasets![0]!.data = [
                    this.network.networkStatistics.minBlockingSetOrgsFilteredSize,
                    this.network.networkStatistics.minBlockingSetFilteredSize,
                    this.network.networkStatistics.minBlockingSetCountryFilteredSize,
                    this.network.networkStatistics.minBlockingSetISPFilteredSize
                ];
            this.chart.update();
        }

        public initializeChart() {
            let chartId = 'livenessRadarChart' + this.id;
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
                            data: [
                                this.network.networkStatistics.minBlockingSetOrgsFilteredSize,
                                this.network.networkStatistics.minBlockingSetFilteredSize,
                                this.network.networkStatistics.minBlockingSetCountryFilteredSize,
                                this.network.networkStatistics.minBlockingSetISPFilteredSize
                            ],
                            fill: true,
                            borderColor: "rgba(25, 151, 198,1)",
                            backgroundColor: "rgba(25, 151, 198, 0.1)",
                        }
                    ]
                },

                // Configuration options go here
                options: {
                    layout: {
                        padding: {
                            left: 0,
                            right: 0,
                            bottom: 10,
                            top: 0
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {
                        display: false
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
                            label: function (tooltipItem, data) {
                                const idx = tooltipItem.datasetIndex;
                                return tooltipItem.value as string;
                            }
                        }
                    },
                    scale:
                        {
                            ticks:{
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

</style>