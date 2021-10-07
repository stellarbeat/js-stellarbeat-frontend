<template>
    <div class="card ">
        <div class="text-muted mx-3 mt-3">
            Validator load
        </div>
        <!--div class="card-header">
            <h3 class="card-title">Validator loads </h3>
            <b-icon-info-circle class="ml-2 mt-0 text-muted" id="overLoadedTooltip"/>
            <b-tooltip target="overLoadedTooltip" placement="top">
                A validator has a high load when it disconnects due to 'high load' most of the time during the last 30 days.
            </b-tooltip>
        </div!-->
        <div class="card-body d-flex flex-row justify-content-center h-75 p-1">
            <div class="canvas-container">
                <canvas id="overLoadedBarChart" ref="overLoadedBarChart"></canvas>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js';

    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import {BTooltip, BIconInfoCircle} from 'bootstrap-vue';

    @Component({
        name: 'validators-server-load',
        components: {BTooltip, BIconInfoCircle}
    })
    export default class ValidatorsServerLoad extends Vue {
        public chart: Chart | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get overloadedBuckets() {
            const buckets: number[] = Array(3).fill(0);
            const bucketReducer = (buckets: number[], overloaded: boolean) => {
                switch (true) {
                    case !overloaded:
                        buckets[0]++;
                        break;
                    case overloaded:
                        buckets[1]++;
                        break;
                }

                return buckets;
            };
            return this.network.nodes
                .filter((node) => node.active && node.isValidator)
                .map((node) => node.overLoaded)
                .reduce(bucketReducer, buckets);
        }

        public initializeBarChart() {
            const context = this.$refs.overLoadedBarChart;
            this.chart = new Chart(context as HTMLCanvasElement, {
                type: 'doughnut',
                // The data for our dataset
                data: {
                    labels: [
                        'low load',
                        'high load',
                    ],
                    datasets: [{
                        label: 'nodes',
                        backgroundColor: [
                            'rgba(25, 151, 198,0.7)', // success blue
                            this.overloadedBuckets[0] >= this.overloadedBuckets[1] ? 'rgba(228, 216, 54, 0.7)' : 'rgba(205, 32, 31, 0.7)',
                        ],
                        borderWidth: 0,
                        data: this.overloadedBuckets,
                    }],
                },

                // Configuration options go here
                options: {
                    layout: {
                        padding: {
                            left: 20,
                            right: 20,
                            bottom: 22
                        }
                    },
                    title: {
                        text: 'Validator loads',
                        display: false,
                        fontSize: 20
                    },
                    responsive: false,
                    maintainAspectRatio: true,
                    cutoutPercentage: 50,
                    legend: {
                        display: true,
                        position: 'bottom',
                    },
                    animation: {
                        duration: 0 // general animation time
                    },
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
    }
</style>