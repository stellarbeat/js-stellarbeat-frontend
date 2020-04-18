<template>
    <canvas height="140px" :width="width" :id="'lineChart' + id"
            :ref="'lineChart' + id"/>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import Chart from 'chart.js';

    interface BarChartDayData {
        t: Date, y: number;
    }
    export type timeUnit = 'day'|'hour'

    @Component({
        name: 'bar-chart-day'
    })
    export default class BarChartDay extends Vue {
        @Prop()
        width!:string;
        @Prop()
        data!:BarChartDayData[];
        @Prop()
        unit!: timeUnit;

        barChart!: Chart;
        id: number = this.store.getUniqueId();

        get store(): Store {
            return this.$root.$data.store;
        }

        get timeFormat(){
            if(this.unit === 'day')
                return 'D-M-YYYY';
            else
                return 'HH:mm';
        }

        get displayFormat() {
            if(this.unit === 'day')
                return {day: this.timeFormat};
            else return {hour: this.timeFormat};
        }

        @Watch('data')
        onDataChanged(){
            this.barChart.data.datasets![0].data = this.data;
            this.barChart.data.datasets![1].data = this.data.map(data => {return {
                t: data.t,
                y: 100 - data.y
            }});
            this.barChart.update();
        }

        mounted(){
            let chartId = 'lineChart' + this.id;
            let context = (this.$refs[chartId] as HTMLCanvasElement).getContext('2d');
            let that = this;
            this.barChart = new Chart(context as CanvasRenderingContext2D, {
                type: 'bar',
                data: {
                    datasets: [{
                        label: 'Validating',
                        backgroundColor: '#5eba00',
                        borderWidth: 0,
                        data: this.data
                    },
                        {
                            label: 'Not Validating',
                            backgroundColor: '#cd201f',
                            borderColor: '#1997c6',
                            data: this.data.map(data => {return {
                                t: data.t,
                                y: 100 - data.y
                            }}),
                            fill: 'origin'
                        }]
                },

                // Configuration options go here
                options: {
                    onHover(event: MouseEvent, activeElements: Array<{}>): any {
                        (event.target! as any).style.cursor = activeElements[0] ? 'pointer' : 'default';
                    },
                    onClick(event?: MouseEvent, activeElements?: Array<{}>): any {
                        if (activeElements && activeElements[0] && Number((activeElements[0] as any)._index) >=0) {
                            that.$emit('click-date', that.data[Number((activeElements[0] as any)._index)].t);
                        }
                    },
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
                        duration: 0 // general animation time
                    },
                    hover: {
                        animationDuration: 0 // duration of animations when hovering an item
                    },
                    responsiveAnimationDuration: 0, // animation duration after a resize
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
                                unit: this.unit,
                                displayFormats: this.displayFormat,
                                tooltipFormat: this.timeFormat,
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
        public beforeDestroy() {
            if (this.barChart) {
                this.barChart.destroy();
            }
        }
    }
</script>

<style scoped>
</style>