<template>
    <canvas height="140px" :width="width" :id="'lineChart' + id"
            :ref="'lineChart' + id" />
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import Chart from 'chart.js';

    @Component({
        name: 'line-chart-hour'
    })
    export default class LineChartHour extends Vue {
        @Prop()
        width!: string;
        @Prop()
        data!: { t: Date, y: number }[];
        @Prop({default: false})
        inverted!:boolean;

        lineChart!: Chart;
        id: number = this.store.getUniqueId();

        get store(): Store {
            return this.$root.$data.store;
        }

        @Watch('data')
        onDataChanged() {
            this.lineChart.data.datasets![0].data = this.data;
            if(!this.inverted) {
                this.lineChart.data.datasets![0].pointBackgroundColor= this.pointColors;
                this.lineChart.data.datasets![0].pointBorderColor= this.pointColors;
            } else {
                this.lineChart.data.datasets![0].pointBackgroundColor= this.pointColors;
                this.lineChart.data.datasets![0].pointBorderColor= this.pointColors;
            }

            this.lineChart.update();
        }

        get pointColors() {
            if(!this.inverted) {
                return this.data.map(point => point.y ? 'rgba(94,186,0,1)' : 'red');
            } else {
                return this.data.map(point => point.y ? 'red': 'rgba(94,186,0,1)');
            }
        }

        mounted() {
            let chartId = 'lineChart' + this.id;
            let context = (this.$refs[chartId] as HTMLCanvasElement).getContext('2d');
            let that = this;
            this.lineChart = new Chart(context as CanvasRenderingContext2D, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Validating',
                        backgroundColor: this.inverted ? 'rgba(255,0,0,0.4)': 'rgba(94,186,0,0.4)',
                        pointBackgroundColor: this.pointColors,
                        pointBorderColor: this.pointColors,
                        pointBorderWidth: 2,
                        borderColor: this.inverted ? 'red': 'rgba(25,186,0,1)',
                        borderWidth: 3,
                        data: this.data
                    }]
                },

                // Configuration options go here
                options: {
                    onHover(event: MouseEvent, activeElements: Array<{}>): any {
                        (event.target! as any).style.cursor = activeElements[0] ? 'pointer' : 'default';
                    },
                    onClick(event?: MouseEvent, activeElements?: Array<{}>): any {
                        if(activeElements && activeElements[0] && (activeElements[0] as any)._index >=0)
                            that.$emit('click-date', that.data[(activeElements[0] as any)._index].t);
                    },
                    tooltips: {
                        callbacks: {
                            label(tooltipItem: Chart.ChartTooltipItem, data: Chart.ChartData): string | string[] {
                                return tooltipItem.value === '1' ? 'Yes' : 'No';
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
                                unit: 'minute',
                                displayFormats: {
                                    'minute': 'HH:mm'
                                }
                            },
                            distribution: 'series',
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
                                fontColor: '#aaa',
                                fontSize: 10,
                                beginAtZero: true,
                                stepSize: 10,
                                callback: function (value, index, values) {
                                    return value ? 'Yes' : 'No';
                                }
                            }
                        }]
                    }
                }
            });
        }
        public beforeDestroy() {
            if (this.lineChart) {
                this.lineChart.destroy();
            }
        }
    }
</script>

<style scoped>
</style>