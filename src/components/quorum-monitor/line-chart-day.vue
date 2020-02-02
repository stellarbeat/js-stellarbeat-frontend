<template>
    <canvas height="140px" :width="width" :id="'lineChart' + id"
            :ref="'lineChart' + id"/>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/Store';
    import Chart from 'chart.js';

    interface LineChartDayData {
        positivePropertyPercentageData: any;
    }

    @Component({
        name: 'line-chart-day'
    })
    export default class LineChartDay extends Vue {
        @Prop()
        width!:string;
        @Prop()
        data!:LineChartDayData;

        lineChart!: Chart;
        id: number = this.store.uniqueId;

        get store(): Store {
            return this.$root.$data.store;
        }

        @Watch('data')
        onDataChanged(){
            this.lineChart.data.datasets![0].data = this.data.positivePropertyPercentageData;
            this.lineChart.update();console.log("clear");
        }

        mounted(){
            let chartId = 'lineChart' + this.id;
            let context = (this.$refs[chartId] as HTMLCanvasElement).getContext('2d');
            this.lineChart = new Chart(context as CanvasRenderingContext2D, {
                type: 'line',
                data: {
                    datasets: [{
                        backgroundColor: '#1997c6',
                        borderWidth: 0,
                        data: this.data.positivePropertyPercentageData
                    }]
                },

                // Configuration options go here
                options: {
                    responsive: false,
                    legend: {
                        display: false
                    },
                    animation: {
                        animateScale: false,
                        animateRotate: false,
                    },
                    scales: {
                        gridLines: {
                            display: false,
                            drawTicks: false,
                        },
                        ticks: {
                            display: false,
                        },
                        scaleLabel: {
                            fontColor: '#f5f7fb',
                            fontSize: 3
                        },
                        xAxes: [{
                            gridLines: {
                                display: true,
                                drawTicks: false,
                                drawBorder: true,
                                drawOnChartArea: false
                            },
                            stacked: true,
                            display: true,
                            type: 'time',
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'D-M-YYYY'
                                },
                                tooltipFormat: 'D-M-YYYY',
                                stepSize: 2,

                            },
                            distribution: 'linear',
                            ticks: {
                                fontColor: '#aaa',
                                fontSize: 10,
                                padding: 8,
                                beginAtZero: true
                            },

                        }],
                        yAxes: [{
                            gridLines: {
                                display: true,
                                drawTicks: false,
                                drawBorder: true,
                                drawOnChartArea: false
                            },
                            stacked: true,
                            display: true,
                            bounds: 'data',
                            ticks: {
                                fontColor: '#aaa',
                                fontSize: 10
                            }
                        }]
                    }
                }
            });
        }
    }
</script>

<style scoped>
</style>