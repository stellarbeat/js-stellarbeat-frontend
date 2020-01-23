<template>
    <div>
        <svg width="100%" :height="maxHeight">
            <g class="y-axis">
                <text style="text-anchor: end;" x="30" y="8">100%</text>
                <text style="text-anchor: end;" x="30" :y="(maxMeasurementHeight+8)/2">50%</text>
                <text style="text-anchor: end;" x="30" :y="maxMeasurementHeight">0%</text>
            </g>
            <g v-for="(statistic, index) in stats" class="measurement" v-b-tooltip.hover
               :title="measurementTitle(statistic)"
               :transform="measurementsTranslation">
                <g class="layer layer-failing">
                    <rect
                            :width="measurementWidth"
                            :height="failingHeight(statistic)"
                            :x="index * measurementStep"
                            y="0"

                    >
                    </rect>
                </g>
                <g class="layer layer-validating">
                    <rect
                            :width="measurementWidth"
                            :height="validatingHeight(statistic)"
                            :x="index * measurementStep"
                            :y="failingHeight(statistic)"
                    >
                    </rect>
                </g>
                <g v-if="statistic.crawlCount === 0" class="layer layer-not-crawled">
                    <rect
                            :width="measurementWidth"
                            :height="maxMeasurementHeight"
                            :x="index * measurementStep"
                            y="0"
                    >
                    </rect>
                </g>
                <g v-if="index%2 === 0" class="layer layer-day">
                    <text style="text-anchor: end;" :x="(index * measurementStep) + (measurementWidth/2) "
                          :y="maxHeight - xAxisHeight + 10" :transform="getXAxisTextTransform(index)">
                        {{statistic.day.toLocaleDateString()}}
                    </text>
                </g>
            </g>
            <g class="x-axis">
                <rect :width="measurementsWidth"
                      height="1"
                      :x="yAxisWidth"
                      :y="maxHeight - xAxisHeight">
                </rect>
            </g>
        </svg>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import {DayStatistic} from '@/Store';

    @Component({
        name: "day-statistics-chart",
    })
    export default class DayStatisticsChart extends Vue {
        isMounted:boolean = false;
        @Prop()
        protected title!: string;
        @Prop()
        protected stats!: DayStatistic[];
        @Prop()
        protected chartWidth!: number;

        protected minHeight:number = 120;

        get maxHeight() {
            return this.chartWidth/5 < this.minHeight ? this.minHeight :  this.chartWidth/5;
        }

        get yAxisWidth() {
            return 40;
        }

        get xAxisHeight() {
            return 50;
        }

        get maxMeasurementHeight() {
            return this.maxHeight - this.xAxisHeight;
        }

        get measurementsWidth() {
            return this.width - this.yAxisWidth;
        }

        get measurementStep() {
            return this.measurementsWidth / 31;
        }

        get measurementWidth() {
            return this.measurementStep * 0.7;
        }

        get measurementsTranslation() {
            return "translate(" + this.yAxisWidth + ", 0)";
        }

        getXAxisTextTransform(index: number) {
            return "rotate(-45," + Math.round((index * this.measurementStep) + this.measurementWidth / 2) + "," + Math.round(this.maxHeight - this.xAxisHeight + 10) + ")";
        }

        measurementTitle(stat: DayStatistic) {
            if (stat.crawlCount === 0)
                return stat.day.toLocaleDateString() + ": no crawl data";

            return stat.day.toLocaleDateString() + ": " + (this.validatingPercentage(stat) * 100).toFixed(2) + "% (" + stat.crawlCount + " crawls)";
        }

        failingPercentage(stat: DayStatistic) {
            if (stat.crawlCount === 0) {
                return 0;
            }
            return (stat.crawlCount - stat.propertyCount) / stat.crawlCount;
        }

        failingHeight(stat: DayStatistic) {
            return Math.round(this.failingPercentage(stat) * this.maxMeasurementHeight);
        }

        validatingPercentage(stat: DayStatistic) {
            if (stat.crawlCount === 0) {
                return 0;
            }
                return stat.propertyCount / stat.crawlCount;
        }

        validatingHeight(stat: DayStatistic) {
            return Math.round(this.validatingPercentage(stat) * this.maxMeasurementHeight);
        }

        get width() {
            return this.chartWidth;//(this.$refs.uptimeSvg as SVGElement).clientWidth;
        }

        mounted() {
            this.isMounted = true;
        }
    }
</script>
<style scoped>
    .measurement {
        cursor: pointer;
    }

    .layer-validating {
        fill: #5eba00;
    }

    .layer-failing {
        fill: #cd201f;
    }

    .layer-not-crawled {
        fill: #e9ecef;
    }

    .layer-day {
        font-size: 10px;
        fill: #aaa;
    }

    .total-percentage {
        color: #aaaaaa;
        font-size: small;
    }

    .spacer {
        flex: 1;
        margin: 0.65rem 1rem 0 0.5rem;
        height: 1px;
        background: #aaa;
        opacity: 0.3
    }

    .y-axis {
        font-size: 10px;
        fill: #aaa;
    }

    .x-axis {
        fill: #e9ecef;
    }
</style>