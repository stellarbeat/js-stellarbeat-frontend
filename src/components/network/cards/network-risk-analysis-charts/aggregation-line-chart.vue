<template>
  <div class="w-100 h-100">
    <canvas :id="'livenessChart' + id" :ref="'livenessChart' + id"></canvas>
  </div>
</template>

<script lang="ts">
import Chart, { ChartDataSets } from "chart.js";

import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import {
  BTooltip,
  BIconInfoCircle,
  BButton,
  BButtonGroup,
} from "bootstrap-vue";
import DateNavigator from "@/components/date-navigator.vue";

@Component({
  components: {
    DateNavigator,
    BTooltip,
    BIconInfoCircle,
    BButton,
    BButtonGroup,
  },
})
export default class AggregationLineChart extends Vue {
  public chart!: Chart;

  @Prop({ default: false })
  protected isYearly!: boolean;

  @Prop()
  chartDataSets!: ChartDataSets[];

  @Prop()
  chartLabels!: any;

  @Prop({ default: false })
  chartLabelFilter!: any;

  @Prop({ default: "minute" })
  unit!:
    | "minute"
    | "millisecond"
    | "second"
    | "hour"
    | "day"
    | "week"
    | "month"
    | "quarter"
    | "year"
    | undefined;

  @Prop({ default: 2 })
  stepSize!: number;

  @Prop({})
  timeDisplayFormats!: Chart.TimeDisplayFormat;

  @Prop({})
  tooltipTimeFormat!: string;

  id: number = this.store.getUniqueId();

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  updateData() {
    this.chart.data.datasets = this.chartDataSets;
    this.chart.update();
  }

  public initializeBarChart() {
    let chartId = "livenessChart" + this.id;
    const context = this.$refs[chartId];
    this.chart = new Chart(context as HTMLCanvasElement, {
      type: "line",
      // The data for our dataset
      data: {
        datasets: this.chartDataSets,
      },

      // Configuration options go here
      options: {
        onHover: (
          event: MouseEvent,
          activeElements: Array<Record<string, unknown>>
        ): void => {
          (event.target! as any).style.cursor = activeElements[0]
            ? "pointer"
            : "default";
        },
        onClick: (
          event?: MouseEvent,
          activeElements?: Array<Record<string, unknown>>
        ): void => {
          if (!activeElements || !activeElements[0]) return;
          let index = Number(activeElements[0]._index);
          let dataSetIndex = Number(activeElements[0]._datasetIndex);
          let dataSet = this.chartDataSets[dataSetIndex];
          if (!dataSet) return;
          //@ts-ignore
          this.$emit("click-date", new Date(dataSet.data[index].x));
        },
        tooltips: {
          callbacks: {
            //@ts-ignore
            label: this.chartLabels,
          },
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        plugins: {
          filler: {
            propagate: true,
          },
        },
        layout: {
          padding: {
            left: 20,
            right: 20,
          },
        },
        title: {
          display: false,
          text: "Quorum availability - liveness analysis",
          fontSize: 16,
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          onClick: (e, legendItem) => {
            if (!legendItem.datasetIndex) return;
            let ci = this.chart;
            let meta = ci.getDatasetMeta(legendItem.datasetIndex);
            //@ts-ignore
            meta.hidden =
              meta.hidden === undefined
                ? //@ts-ignore
                  !ci.data.datasets[legendItem.datasetIndex].hidden
                : null;
            this.chartDataSets[legendItem.datasetIndex].hidden = meta.hidden;
            ci.update();
          },
          display: true,
          position: "top",
          labels: {
            filter: this.chartLabelFilter,
          },
        },
        animation: {
          duration: 0, // general animation time
        },
        scales: {
          xAxes: [
            {
              offset: false,
              type: "time",
              time: {
                unit: this.unit,
                stepSize: this.stepSize,
                displayFormats: this.timeDisplayFormats,
                tooltipFormat: this.tooltipTimeFormat,
              },
              gridLines: {
                offsetGridLines: false,
                display: false,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                stepSize: 1,
              },
            },
          ],
        },
      },
    });
  }

  public async mounted() {
    this.initializeBarChart();
  }

  public beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped>
.canvas-container {
  height: 400px;
  width: 100%;
}
</style>
