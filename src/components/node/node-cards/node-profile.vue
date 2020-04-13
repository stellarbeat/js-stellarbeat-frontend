<template>
    <div class="card card-profile">
        <div class="card-body d-flex flex-column justify-content-center">
            <div class="text-center">
                <h3 class="mb-1">
                    <b-icon-shield v-b-tooltip.hover v-if="node.isFullValidator" title="Full validator"
                                   class="border border-success bg-success rounded" variant="light"/>
                    {{node.displayName}}
                </h3>
                <h4 class="card-subtitle mt-0">
                    {{node.publicKey.substr(0, 20)}}...{{node.publicKey.substr(50, 100)}}
                </h4>
            </div>
            <div class="d-flex flex-row flex-wrap justify-content-center">
                    <canvas id="indexChart" width="100px" height="80px" ref="indexChart"/>
                    <canvas id="validatingChart" width="100px" height="80px" ref="validatingChart"/>
            </div>


        </div>
    </div>
</template>
<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import Vue from 'vue';
    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import Chart from 'chart.js';

    @Component({})
    export default class NodeProfile extends Vue {
        @Prop()
        protected node!: Node;
        public chart: Chart | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        mounted() {
            const context = this.$refs.indexChart;
            this.chart = new Chart(context as HTMLCanvasElement, {
                type: 'doughnut',

                data: {
                    datasets: [{
                        label: 'index',
                        backgroundColor: [
                            '#1997c6', // success blue
                            'gray'
                        ],
                        data: [this.node.index, 1 - this.node.index],
                    }],
                    labels: [
                        'Index',
                        ''
                    ]
                },
                // Configuration options go here
                options: {
                    title: {
                        display: true,
                        text: 'Index',
                        position: 'bottom',
                        padding: 5,
                    },
                    legend: {
                        display: false
                    },
                    responsive: false,
                    cutoutPercentage: 60,
                    maintainAspectRatio: true

                },
            });
            const context2 = this.$refs.validatingChart;
            new Chart(context2 as HTMLCanvasElement, {
                type: 'doughnut',

                data: {
                    datasets: [{
                        backgroundColor: [
                            '#5eba00', // success blue
                            '#cd201f'
                        ],
                        data: [this.node.statistics.validating24HoursPercentage, 100 - this.node.statistics.validating24HoursPercentage],
                    }],
                    labels: [
                        'Validating',
                        'Failing'
                    ]
                },
                // Configuration options go here
                options: {
                    title: {
                        display: true,
                        text: '24H Validating',
                        position: 'bottom',
                        padding: 5,
                    },
                    legend: {
                        display: false
                    },
                    responsive: false,
                    cutoutPercentage: 60,
                    maintainAspectRatio: false

                },
            });
        }

        public beforeDestroy() {
            if (this.chart) {
                this.chart.destroy();
            }
        }
    };
</script>

<style scoped>
    li {
        margin-bottom: 5px;
    }

    .title {
        font-size: 24px;
        line-height: 1.2;
        font-weight: 400;
    }

    .public-key {

    }

    .type {
        font-size: 16px;
        color: #9aa0ac;
    }

    .profile-list {
        list-style: none;
    }

    .social-link {
        text-decoration: none;
    }
    .chart-container {
        height: 70px;
        width: 140px;
    }
</style>
