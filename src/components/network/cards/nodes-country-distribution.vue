<template>
    <div class="card ">
        <div class="text-muted mx-3 mt-3">
            Countries
        </div>
        <div class="card-body d-flex flex-row justify-content-center p-1">
            <div class="canvas-container">
                <canvas id="countryDistributionGraph" ref="countryDistributionGraph"></canvas>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js';

    import Vue from 'vue';
    import {Component, Watch} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';

    @Component({
        name: 'nodes-country-distribution',
    })

    export default class NodesCountryDistribution extends Vue {
        public chart: Chart | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        @Watch('store.includeWatcherNodes')
        protected onWatcherNodesOptionChanged() {
            this.chart!.data.datasets![0].data = this.chartData;
            this.chart!.update();
        }

        get sortedCountries() {
            let countries = this.network.nodes
                .filter(this.store.watcherNodeFilter)
                .filter(node => node.geoData.countryName)
                .map(node => node.geoData.countryName)
                .reduce((accumulator: any, currentValue: string | null) => {
                    if (currentValue === null) {
                        return accumulator;
                    }
                    if (!accumulator[currentValue])
                        accumulator[currentValue] = 1;
                    else
                        accumulator[currentValue]++;
                    return accumulator;
                }, {});

            let sortedCountries = [];
            for (let countryName in countries) {
                sortedCountries.push([countryName, countries[countryName]]);
            }

            return sortedCountries.sort(function (a, b) {
                return b[1] - a[1];
            });
        }

        get chartData() {
            let countries = [];
            if(this.sortedCountries[0])
               countries.push(this.sortedCountries[0][1]);
            if(this.sortedCountries[1])
                countries.push(this.sortedCountries[1][1]);
            if(this.sortedCountries[2])
                countries.push(this.sortedCountries[2][1]);
            if(this.sortedCountries[3])
                countries.push(this.sortedCountries.slice(3).reduce((accumulator, currentValue) => {
                    return accumulator + currentValue[1];
                }, 0))
            ;

            return countries;
        }
        get labels(){
            let labels = [];
            if(this.sortedCountries[0])
                labels.push(this.sortedCountries[0][0]);
            if(this.sortedCountries[1])
                labels.push(this.sortedCountries[1][0]);
            if(this.sortedCountries[2])
                labels.push(this.sortedCountries[2][0]);
            if(this.sortedCountries[3])
                labels.push('Other');

            return labels;
        }

        initializeDoghnut() {
            if (this.sortedCountries.length === 0) {
                return;
            }
            let context = (this.$refs.countryDistributionGraph as HTMLCanvasElement).getContext('2d');
            this.chart = new Chart(context as CanvasRenderingContext2D, {
                type: 'doughnut',
                // The data for our dataset
                data: {
                    labels: this.labels,
                    datasets: [{
                        label: 'Node countries',
                        backgroundColor: [
                            'rgba(25, 151, 198,0.7)', // primary blue
                            'rgba(27, 201, 141,0.7)', // success green
                            'rgba(228, 216, 54,0.7)' // warning yellow
                        ],
                        borderColor: [
                            'rgba(25, 151, 198,1)', // primary blue
                            '#1bc98e', // success green
                            '#e4d836' // warning yellow
                        ],
                        borderWidth: 0,
                        data: this.chartData
                    }]
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
                        text: 'Node countries',
                        display: false,
                        fontSize: 20
                    },
                    responsive: true,
                    maintainAspectRatio: true,
                    cutoutPercentage: 50,
                    legend: {
                        display: true,
                        position: 'bottom',

                    },
                    animation: {
                        duration: 0 // general animation time
                    },
                }
            });
        }

        mounted() {
            this.initializeDoghnut();
        }

        beforeDestroy() {
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