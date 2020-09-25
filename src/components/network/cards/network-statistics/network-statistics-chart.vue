<template>
    <div class="w-100 h-100">
        <canvas :id="'networkStatisticsChart' + id" :ref="'networkStatisticsChart' + id">
        </canvas>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator';
import {BTooltip, BIconInfoCircle} from 'bootstrap-vue';
import Chart from 'chart.js';
import {StoreMixin} from '@/mixins/StoreMixin';
import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
import moment from 'moment';
import NetworkStatisticsAggregation from '@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation';

@Component({
    components: {BTooltip, BIconInfoCircle}
})
export default class NetworkStatisticsChart extends Mixins(StoreMixin) {
    public chart!: Chart;
    protected id!: number;

    @Prop()
    yearStatistics!: NetworkStatisticsAggregation[];

    @Prop()
    statsProperty!:string;

    public created() {
        this.id = this.store.getUniqueId();
    }

    public async mounted() {
        this.initializeBarChart();
    }

    getAggregatedDataSets(statisticsAggregation: NetworkStatisticsAggregation[]) {
        return [
            {
                borderColor:  'rgba(25, 151, 198,1)',
                backgroundColor: 'rgba(25, 151, 198,0.3)', // primary blue
                borderWidth: 2,
                steppedLine: false,
                data: statisticsAggregation.map(stat => {
                    if(stat.crawlCount === 0)
                        return {};
                    return {
                        x: stat.time,
                        //@ts-ignore
                        y: stat.crawlCount !== 0 ? stat[this.statsProperty] : 0.1
                    };
                }),
            }];
    }

    public initializeBarChart() {
        let chartId = 'networkStatisticsChart' + this.id;
        const context = this.$refs[chartId];
        let that = this;
        this.chart = new Chart(context as HTMLCanvasElement, {
            type: 'line',
            // The data for our dataset
            data: {
                datasets: this.getAggregatedDataSets(this.yearStatistics)
            },

            // Configuration options go here
            options: {
                onHover(event: MouseEvent, activeElements: Array<any>): any {
                    (event.target! as any).style.cursor = 'pointer';
                    if(activeElements.length === 1)
                        that.$emit('hover', that.yearStatistics[activeElements[0]._index]);
                    else
                        that.$emit('hover', null);
                },
                hover: {
                    mode: 'nearest',
                    intersect: false
                },
                tooltips: {
                    enabled: false,
                    mode: 'index',
                    intersect: false,
                    caretSize: 0,
                    displayColors: false,
                    callbacks: {
                        title: function (tooltipItems, data) {
                            //Return value for title
                            return '';
                        },
                        label: function (tooltipItems, data) {
                            return tooltipItems.label + ': ' + tooltipItems.value;
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 4,
                        bottom: 0
                    }
                },
                title: {
                    display: false,
                },
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false,
                },
                animation: {
                    duration: 0 // general animation time
                },
                scales: {
                    xAxes: [{
                        offset: false,
                        display: false,
                        type: 'time',
                        distribution: 'series',
                        time: {
                            unit: 'year',
                            stepSize: 1,
                            tooltipFormat: 'MMM YYYY'
                        },
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            beginAtZero: false
                        }
                    }]
                }
            },
        });
    }
}
</script>

<style scoped>
</style>