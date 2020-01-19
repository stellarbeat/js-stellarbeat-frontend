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
            <canvas id="versionGraph" ref="versionGraph"></canvas>
        </div>
    </div>
</template>

<script lang="ts">
    import Chart from 'chart.js'

    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';

    import {Network} from '@stellarbeat/js-stellar-domain';

    @Component({
        name: 'nodes-versions',
    })
    export default class NodesVersions extends Vue {
        @Prop()
        public network!:Network;

        public chart: Chart|null = null;

        get otherVersionsCount(): number {
            return this.sortedVersions.slice(4).reduce((accumulator, currentValue) => {
                return accumulator + currentValue[1];
            },0)
        }

        get activeNodesWithVersionCount(): number {
            return this.network.nodes.filter(node => node.active && node.versionStr).length;
        }

        get sortedVersions() {
            let versions = this.network.nodes
                .filter(node => node.active)
                .filter(node => node.versionStr)
                .map(node => node.versionStr!.replace("stellar-core ", "").replace("v","").replace(/ \(.*$/, "").replace(/\-.*$/,""))
                .reduce((accumulator:any, currentValue:string) => {
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

            return sortedVersions.sort(function(a:Array<number>, b:Array<number>) {
                return b[1] - a[1];
            });
        }

        initializeDoghnut() {
            let context = (this.$refs.versionGraph as HTMLCanvasElement).getContext('2d');
            this.chart = new Chart(context as CanvasRenderingContext2D, {
                type: 'doughnut',
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
        }

        mounted() {
            this.initializeDoghnut();
        }

        beforeDestroy() {
            if(this.chart)
               this.chart.destroy()
        }
    }
</script>

<style>

</style>