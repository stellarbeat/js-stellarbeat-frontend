<template>
    <div class="card ">
        <div class="card-header">
            <h3 class="card-title">Node Versions</h3>
            <div class="card-options">
                <router-link class="btn btn-sm btn-outline-primary" :to="{ name: 'nodes'}">View all nodes
                </router-link>
            </div>
        </div>
        <div class="card-body p-3 pb-6">
            <canvas id="geoDoughnut" ref="geoDoughnut"></canvas>
            <!--table class="table table-striped table-bordered mt-4" id="locations-table">
                <thead class="thead-light">
                <tr>
                    <th>Version</th>
                    <th>Nodes</th>
                    <th>%</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="country in sortedVersions.slice(0,4)">
                    <td>{{ country[0] }}</td>
                    <td>{{ country[1] }}</td>
                    <td>{{ Math.round( country[1] / activeNodesWithVersionCount * 100) }}
                        %
                    </td>
                </tr>
                <tr>
                    <td>Other countries</td>
                    <td>{{ otherVersionsCount }}
                    </td>
                    <td>{{ Math.round(otherVersionsCount / activeNodesWithVersionCount * 100) }}
                        %
                    </td>
                </tr>
                </tbody>
            </table!-->
        </div>
        <!--div class="card-footer">
            Geolocation data was retrieved using the <a href="https://ipstack.com/">ipstack API</a> using
            each
            node's IP.
        </div!-->
    </div>
</template>

<script>
    import Chart from 'chart.js/dist/Chart.js'

    export default {
        name: "nodes-versions",
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
            otherVersionsCount: function () {
               return this.sortedVersions.slice(4).reduce((accumulator, currentValue) => {
                   return accumulator + currentValue[1];
               },0)
            },
            activeNodesWithVersionCount: function () {
                return this.network.nodes.filter(node => node.active && node.versionStr).length;
            },
            sortedVersions: function () {
                let versions = this.network.nodes
                    .filter(node => node.active)
                    .filter(node => node.versionStr)
                    .map(node => node.versionStr.replace("stellar-core ", "").replace("v","").replace(/ \(.*$/, "").replace(/\-.*$/,""))
                    .reduce((accumulator, currentValue) => {
                        if(accumulator[currentValue] === undefined)
                            accumulator[currentValue] = 1;
                        else
                            accumulator[currentValue] ++;
                        return accumulator;
                    }, {});

                let sortedVersions = [];
                for(let versionStr in versions ) {
                    sortedVersions.push([versionStr, versions[versionStr]]);
                }

                return sortedVersions.sort(function(a, b) {
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
                        labels: this.sortedVersions.map(versionArray => versionArray[0]),
                        datasets: [{
                            label: "Node versions",
                            backgroundColor: [
                                '#1997c6', // primary blue
                                '#1bc98e', // success green
                                '#9f86ff', // info purple
                                '#e4d836' // warning yellow
                            ],
                            data: this.sortedVersions.map(versionArray => versionArray[1]),
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