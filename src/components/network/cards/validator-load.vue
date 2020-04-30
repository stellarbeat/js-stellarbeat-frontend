<template>
    <div class="card ">
        <div class="card-header">
            <h3 class="card-title">Validator loads </h3>
            <b-icon-info-circle class="ml-2 mt-0 text-muted" id="overLoadedTooltip"/>
            <b-tooltip target="overLoadedTooltip" placement="top">
                A validator has a high load when it disconnects due to 'high load' most of the time during the last 30 days.
            </b-tooltip>
        </div>
        <div class="card-body p-3 pb-6">
            <canvas id="overLoadedBarChart" ref="overLoadedBarChart"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
import Chart from 'chart.js';

import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';

import {Network} from '@stellarbeat/js-stellar-domain';
import Store from '@/store/Store';
import {BTooltip, BIconInfoCircle} from 'bootstrap-vue';

@Component({
    name: 'validators-server-load',
    components: {BTooltip, BIconInfoCircle}
})
export default class ValidatorsServerLoad extends Vue {
    public chart: Chart|null = null;

    get store(): Store {
        return this.$root.$data.store;
    }

    get network(): Network {
        return this.store.network;
    }

    get overloadedBuckets() {
        const buckets: number[] = Array(3).fill(0);
        const bucketReducer = (buckets: number[], currentOverLoadedPercentage: number) => {
            switch (true) {
                case currentOverLoadedPercentage <= 40:
                    buckets[0]++;
                    break;
                case currentOverLoadedPercentage <= 80:
                    buckets[1]++;
                    break;
                case currentOverLoadedPercentage <= 100:
                    buckets[2]++;
                    break;
            }

            return buckets;
        };
        return this.network.nodes
            .filter((node) => node.active && node.isValidator)
            .map((node) => node.statistics.overLoaded30DaysPercentage)
            .reduce(bucketReducer, buckets);
    }

    public initializeBarChart() {
        const context = this.$refs.overLoadedBarChart;
        this.chart = new Chart(context as HTMLCanvasElement, {
            type: 'doughnut',
            // The data for our dataset
            data: {
                labels: [
                    'low',
                    'medium',
                    'high',
                ],
                datasets: [{
                    label: 'nodes',
                    backgroundColor: [
                        '#1997c6', // success blue
                        'rgba(228, 216, 54)', // warning yellow
                        '#cd201f', // danger red
                    ],
                    data: this.overloadedBuckets,
                }],
            },

            // Configuration options go here
            options: {
                responsive: true,
                aspectRatio: 1.45,
                cutoutPercentage: 60,
                legend: {
                    display: true,
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

<style>

</style>