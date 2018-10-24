<template>
    <div class="card ">
        <div class="card-header">
            <h3 class="card-title">Node geographical distribution</h3>
        </div>
        <div class="card-body p-3">
            <canvas id="geoDoughnut" ref="geoDoughnut"></canvas>
            <table class="table table-striped table-bordered mt-4" id="locations-table">
                <thead class="thead-light">
                <tr>
                    <th>Country</th>
                    <th>Nodes</th>
                    <th>%</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="country in sortedCountries.slice(0,4)">
                    <td>{{ country[0] }}</td>
                    <td>{{ country[1] }}</td>
                    <td>{{ Math.round( country[1] / activeNodesWithCountryCount * 100) }}
                        %
                    </td>
                </tr>
                <tr>
                    <td>Other countries</td>
                    <td>{{ otherCountriesCount }}
                    </td>
                    <td>{{ Math.round(otherCountriesCount / activeNodesWithCountryCount * 100) }}
                        %
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
        <div class="card-footer">
            Geolocation data was retrieved using the <a href="https://ipstack.com/">ipstack API</a> using
            each
            node's IP.
        </div>
    </div>
</template>

<script>
    const Chart = require("chart.js");

    export default {
        name: "nodes-country-distribution",
        data() {
            return {
                chart: {}
            }
        },
        props: {
            network: {
                type: Object
            }
        },
        computed: {
            otherCountriesCount: function () {
               return this.sortedCountries.slice(4).reduce((accumulator, currentValue) => {
                   return accumulator + currentValue[1];
               },0)
            },
            activeNodesWithCountryCount: function () {
                return this.network.nodes.filter(node => node.active && node.geoData.countryName).length;
            },
            sortedCountries: function () {
                let countries = this.network.nodes
                    .filter(node => node.active)
                    .filter(node => node.geoData.countryName)
                    .map(node => node.geoData.countryName)
                    .reduce((accumulator, currentValue) => {
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
        },
        methods: {
            //todo: refactor to vue.js way
            initializeDoghnut: function () {
                let context = this.$refs.geoDoughnut.getContext('2d');


               this.chart = new Chart(context, {
                    type: 'doughnut',
                    // The data for our dataset
                    data: {
                        labels: [
                            this.sortedCountries[0][0],
                            this.sortedCountries[1][0],
                            this.sortedCountries[2][0],
                            this.sortedCountries[3][0],
                            "Other countries"
                        ],
                        datasets: [{
                            label: "Node countries",
                            backgroundColor: [
                                '#1997c6', // primary blue
                                '#1bc98e', // success green
                                '#9f86ff', // info purple
                                '#e4d836' // warning yellow
                            ],
                            data: [
                                this.sortedCountries[0][1],
                                this.sortedCountries[1][1],
                                this.sortedCountries[2][1],
                                this.sortedCountries[3][1],
                                this.sortedCountries.slice(4).reduce((accumulator, currentValue) => {
                                    return accumulator + currentValue[1];
                                },0)
                            ],
                        }]
                    },

                    // Configuration options go here
                    options: {
                        legend: {
                            display: true
                        },
                        animation: {
                            animateScale: true, // animate from small to large
                                animateRotate: false // animate clockwise
                        }
                    }
                });
            },

        },
        mounted() {
            this.initializeDoghnut();
        },
        beforeDestroy: function () {
            this.chart.destroy()
        }
    }
</script>

<style>

</style>