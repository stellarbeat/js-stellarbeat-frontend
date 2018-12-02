<template>
    <div class="card ">
        <div class="card-header">
            <h3 class="card-title">Validator loads </h3>
            <i id="overLoadedTooltip" class="fe fe-info ml-2 mt-0 text-muted"></i>
            <b-tooltip target="overLoadedTooltip" placement="top">
                A validator has a high load when it disconnects due to 'high load' most of the time during the latest 300 crawls.
            </b-tooltip>
            <div class="card-options">
                <router-link class="btn btn-sm btn-outline-primary" :to="{ name: 'nodes'}">View all nodes
                </router-link>
            </div>
        </div>
        <div class="card-body p-3 pb-6">
            <canvas id="overLoadedBarChart" ref="overLoadedBarChart"></canvas>
        </div>
    </div>
</template>

<script>
    import Chart from 'chart.js/dist/Chart.js'

    export default {
        name: "validators-server-load",
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
            overloadedBuckets: function() {
                let buckets = [...Array(3)].map(_=>[0]); // initialize with zero counts
                let bucketReducer = (buckets, currentOverLoadedRating) => {
                    switch (true) {
                        case currentOverLoadedRating <=2:
                            buckets[0]++;
                            break;
                        case currentOverLoadedRating <=4:
                            buckets[1]++;
                            break;
                        case currentOverLoadedRating <=5:
                            buckets[2]++;
                            break;
                    }

                    return buckets;
                };
                return this.network.nodes
                    .filter(node => node.active && node.quorumSet.hasValidators())
                    .map(node => node.statistics.overLoadedRating)
                    .reduce(bucketReducer,buckets);
            }
        },
        methods: {
            //todo: refactor to vue.js way
            initializeBarChart: function () {
                let context = this.$refs.overLoadedBarChart;
                this.chart = new Chart(context, {
                    type: 'doughnut',
                    // The data for our dataset
                    data: {
                        labels: [
                            "low",
                            "medium",
                            "high"
                        ],
                        datasets: [{
                            label: "nodes",
                            backgroundColor: [
                                '#1997c6', // success blue
                                'rgba(228, 216, 54)', // warning yellow
                                '#cd201f', // danger red
                            ],
                            data: this.overloadedBuckets,
                        }]
                    },

                    // Configuration options go here
                    options: {
                        legend: {
                            display: true
                        }
                    }
                });
            },

        },
        mounted() {
            this.initializeBarChart();
        },
        beforeDestroy: function () {
            this.chart.destroy()
        }
    }
</script>

<style>

</style>