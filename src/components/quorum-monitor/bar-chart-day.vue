<template>
    <canvas height="140px" :width="width" :id="'lineChart' + id"
            :ref="'lineChart' + id"/>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/Store';
    import Chart from 'chart.js';

    interface BarChartDayData {
        positivePropertyPercentageData: any;
        negativePropertyPercentageData: any;
    }

    @Component({
        name: 'bar-chart-day'
    })
    export default class BarChartDay extends Vue {
        @Prop()
        width!:string;
        @Prop()
        data!:BarChartDayData;

        lineChart!: Chart;
        id: number = this.store.uniqueId;

        get store(): Store {
            return this.$root.$data.store;
        }

        @Watch('data')
        onDataChanged(){
            this.lineChart.data.datasets![0].data = this.data.positivePropertyPercentageData;
            this.lineChart.data.datasets![1].data = this.data.negativePropertyPercentageData;
            this.lineChart.update();
        }

        mounted(){
            let chartId = 'lineChart' + this.id;
            let context = (this.$refs[chartId] as HTMLCanvasElement).getContext('2d');
            this.lineChart = new Chart(context as CanvasRenderingContext2D, {
                type: 'bar',
                data: {
                    datasets: [{
                        label: 'Validating',
                        backgroundColor: '#5eba00',
                        borderWidth: 0,
                        data: this.data.positivePropertyPercentageData
                    },
                        {
                            label: 'Not Validating',
                            backgroundColor: 'red',
                            borderColor: '#1997c6',
                            data: this.data.negativePropertyPercentageData,
                            fill: 'origin'
                        }]
                },

                // Configuration options go here
                options: {
                    tooltips: {
                        callbacks: {
                            label(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData): string | string[] {
                                return ' ' + tooltipItem.value + '%';
                            }
                        },
                    },
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
                                padding: 8,
                                min: 0,
                                max: 100,
                                fontColor: '#aaa',
                                fontSize: 10,
                                beginAtZero: true,
                                stepSize: 50,
                                callback: function (value, index, values) {
                                    return value + '%';
                                }
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