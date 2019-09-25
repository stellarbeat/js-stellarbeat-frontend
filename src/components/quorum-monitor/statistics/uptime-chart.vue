<template>
    <div>
        <h5 v-if="false">{{title}}</h5>
        <svg ref="uptimeSvg" width="100%" :height="measurementHeight">
            <rect v-if="isMounted" v-for="(statistic, index) in statistics"
                  :class="getMeasurePointClass(statistic)"
                  :width="measurementWidth"
                  :height="measurementHeight"
                  :x="index * measurementStep"
                  y="0"
                  v-b-tooltip.hover :title="statistic[0] + ': ' + statistic[1] * 100 + '%'"
            >
            </rect>
        </svg>
        <div class="total-percentage d-flex justify-content-center">
            <div class="spacer"></div>
            <span class="total-percentage-span mute">100</span> % {{ title }}
            <div class="spacer"></div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    @Component({
        name: "uptime-chart"
    })
    export default class UptimeChart extends Vue
    {
        @Prop()
        protected title!:string;
        //todo: prop
        protected statistics: [string, number][] = [["2019-08-24", 1.0], ["2019-08-25", 1.0], ["2019-08-26", 1.0], ["2019-08-27", 0.998046875], ["2019-08-28", 1.0], ["2019-08-29", 1.0], ["2019-08-30", 0.9980732177263969], ["2019-08-31", 0.5290697674418605], ["2019-09-01", 0.0], ["2019-09-02", 0.0], ["2019-09-03", 0.0], ["2019-09-04", 0.0], ["2019-09-05", 0.9881656804733728], ["2019-09-06", 1.0], ["2019-09-07", 1.0], ["2019-09-08", 1.0], ["2019-09-09", 1.0], ["2019-09-10", 1.0], ["2019-09-11", 1.0], ["2019-09-12", 1.0], ["2019-09-13", 1.0], ["2019-09-14", 1.0], ["2019-09-15", 1.0], ["2019-09-16", 1.0], ["2019-09-17", 1.0], ["2019-09-18", 1.0], ["2019-09-19", 1.0], ["2019-09-20", 1.0], ["2019-09-21", 1.0], ["2019-09-22", 1.0], ["2019-09-23", 1.0]]
            .map((stat) => {
                return [
                    new Date(stat[0]).toDateString(),
                    stat[1] as number
                ];
            });

        protected measurementHeight: number = 25;
        protected isMounted: boolean = false;

        get measurementStep() {
            return this.width / 31;
        }

        get measurementWidth() {
            return this.measurementStep * 0.5;
        }

        get width() {
            return (this.$refs.uptimeSvg as SVGElement).clientWidth;
        }

        get height() {
            return (this.$refs.uptimeSvg as SVGElement).clientHeight;
        }

        getMeasurePointClass(statistic: [string, number]) {
            return {
                "measure-point-green": statistic[1] > 0.99,
                "measure-point-warning": statistic[1] > 0 && statistic[1] <= 0.99,
                "measure-point-danger": statistic[1] === 0
            };
        }

        mounted() {
            this.renderStats();
        }

        renderStats() {
            this.isMounted = true;
        }
    }
</script>
<style scoped>
    .measure-point-green {
        fill: #5eba00;
    }

    .measure-point-warning {
        fill: #f1c40f;
    }

    .measure-point-danger {
        fill: #e9ecef;
    }

    .measure-point:hover {
        fill: darkgreen;
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
</style>