<template>
    <div class="card ">
        <div class="card-header">
            <h3 class="card-title">Node countries</h3>
        </div>
        <div class="card-body p-3 pb-6">
            <canvas id="countryDistributionGraph" ref="countryDistributionGraph"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js'

    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';

    @Component({
        name: 'nodes-country-distribution',
    })
    
    export default class NodesCountryDistribution extends Vue {
        @Prop()
        public network!: Network;

        public chart: Chart|null = null;

        get sortedCountries() {
            let countries = this.network.nodes
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
                        "Other countries"
                    ],
                    datasets: [{
                        label: "Node countries",
                        backgroundColor: [
                            '#1997c6', // primary blue
                            '#1bc98e', // success green
                            '#e4d836' // warning yellow
                        ],
                        data: [
                            this.sortedCountries[0][1],
                            this.sortedCountries[1][1],
                            this.sortedCountries[2][1],
                            this.sortedCountries.slice(3).reduce((accumulator, currentValue) => {
                                return accumulator + currentValue[1];
                            },0)
                        ],
                    }]
                },

                // Configuration options go here
                options: {
                    responsive: true,
                    aspectRatio: 1.45,
                    cutoutPercentage: 70,
                    legend: {
                        display: true
                    },
                    animation: {
                        animateScale: true, // animate from small to large
                        animateRotate: false // animate clockwise
                    }
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

<style>

</style>