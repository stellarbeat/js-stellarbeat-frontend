<template>
    <div class="d-flex flex-column align-items-center">
        <div class="relative mb-2">
            <canvas :height="height" :width="width" ref="chart"/>
            <div class="absolute-center text-center">
                {{centerText}}
            </div>
        </div>
        <div class="title">
            {{title}}
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import Chart from 'chart.js';

    @Component({})
    export default class Gauge extends Vue {
        @Prop()
        width!: string;
        @Prop()
        height!: string;
        @Prop()
        value!: number;
        @Prop({default: '#1997c6'})
        valueColor!: string;
        @Prop({default: '#e6e5e5'})
        negativeValueColor!: string;
        @Prop()
        maxValue!: number;
        @Prop()
        title!: string;
        @Prop()
        centerText!: string;

        chart!: Chart;

        get store(): Store {
            return this.$root.$data.store;
        }

        @Watch('value')
        onValueChanged() {
            console.log('update');
            this.chart.data.datasets![0].data = [this.value, Math.round((this.maxValue - this.value)*100)/100];

            this.chart.update();
        }

        mounted() {
            let canvas = this.$refs.chart as HTMLCanvasElement;
            this.chart = new Chart(canvas, {
                type: 'doughnut',

                data: {
                    datasets: [{
                        label: this.title,
                        backgroundColor: [
                            this.valueColor,
                            this.negativeValueColor
                        ],
                        data: [this.value,  Math.round((this.maxValue - this.value)*100)/100],
                    }],
                    labels: [
                        this.title,
                        ''
                    ]
                },
                // Configuration options go here
                options: {
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    },
                    hover: {mode: undefined},
                    responsive: false,
                    cutoutPercentage: 70,
                    maintainAspectRatio: true

                },
            });
        }

        public beforeDestroy() {
            if (this.chart) {
                this.chart.destroy();
            }
        }
    }
</script>

<style scoped>
    .title {
        font-weight: bold;
        font-size: 16px;
        opacity: 0.7;
    }

    .relative {
        position: relative;
    }

    .absolute-center {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .text-center {
        text-align: center;
        font-weight: bold;
        font-size: 15px;
        opacity: 0.6;
    }
</style>