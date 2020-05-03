<template>
    <div class="card ">
        <div class="card-body d-flex flex-row justify-content-center">
            <div class="canvas-container">
                <canvas id="countryDistributionGraph" ref="countryDistributionGraph"></canvas>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js'

    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import {latLng} from 'leaflet';

    @Component({
        name: 'nodes-country-distribution',
    })
    
    export default class NodesCountryDistribution extends Vue {
        public chart: Chart|null = null;

        get store(): Store {
            return this.$root.$data.store;
        }
        get network(): Network {
            return this.store.network;
        }

        @Watch('store.includeWatcherNodes')
        protected onWatcherNodesOptionChanged(){
            this.chart!.data.datasets![0].data = this.chartData;
            this.chart!.update();
        }

        get sortedCountries() {
            let countries = this.network.nodes
                .filter(this.store.watcherNodeFilter)
                .filter(node => node.active)
                .filter(node => node.geoData.countryName)
                .map(node => node.geoData.countryName)
                .reduce((accumulator:any, currentValue:string|undefined) => {
                    if(currentValue === undefined) {
                        return accumulator;
                    }
                    if(accumulator[currentValue] === undefined)
                        accumulator[currentValue] = 1;
                    else
                        accumulator[currentValue] ++;
                    return accumulator;
                }, {});

            let sortedCountries = [];
            for(let countryName in countries ) {
                sortedCountries.push([countryName, countries[countryName]]);
            }

            return sortedCountries.sort(function(a, b) {
                return b[1] - a[1];
            });
        }

        get chartData() {
            return [
                this.sortedCountries[0][1],
                this.sortedCountries[1][1],
                this.sortedCountries[2][1],
                this.sortedCountries.slice(3).reduce((accumulator, currentValue) => {
                    return accumulator + currentValue[1];
                },0)
            ];
        }

        initializeDoghnut() {
            if(this.sortedCountries.length === 0) {
                return;
            }
            let context = (this.$refs.countryDistributionGraph as HTMLCanvasElement).getContext('2d');
            this.chart = new Chart(context as CanvasRenderingContext2D, {
                type: 'doughnut',
                // The data for our dataset
                data: {
                    labels: [
                        this.sortedCountries[0][0],
                        this.sortedCountries[1][0],
                        this.sortedCountries[2][0],
                        "Other"
                    ],
                    datasets: [{
                        label: "Node countries",
                        backgroundColor: [
                            '#1997c6', // primary blue
                            '#1bc98e', // success green
                            '#e4d836' // warning yellow
                        ],
                        data: this.chartData
                    }]
                },

                // Configuration options go here
                options: {

                    title: {
                       text: 'Node countries',
                        display: true,
                        fontSize: 20
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    cutoutPercentage: 70,
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
            if(this.chart) {
                this.chart.destroy()
            }
        }
    }
</script>

<style scoped>
    .canvas-container {
        height: 220px;
    }
</style>