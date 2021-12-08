<template>
  <div class="w-100 h-100">
    <canvas :id="'livenessChart' + id" :ref="'livenessChart' + id"></canvas>
  </div>
</template>

<script lang="ts">
import {
  ActiveElement,
  Chart,
  ChartDataset,
  ChartEvent,
  Legend,
  LegendItem,
  LinearScale,
  LineController,
  LineElement,
  Point,
  TimeScale,
  Tooltip,
  TooltipItem,
} from "chart.js";
import "chartjs-adapter-moment";

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
import useStore from "@/useStore";

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
  chartDataSets!: ChartDataset[];

  @Prop()
  chartLabels!: (tooltipItem: TooltipItem<"line">) => string;

  @Prop({ default: false })
  chartLabelFilter!: never;

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
  timeDisplayFormats!: Record<string, string>;

  @Prop({})
  tooltipTimeFormat!: string;

  id: number = this.store.getUniqueId();

  get store(): Store {
    return useStore();
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
    Chart.register(
      TimeScale,
      LineElement,
      LineController,
      Legend,
      Tooltip,
      LinearScale
    );
    this.chart = new Chart(context as HTMLCanvasElement, {
      type: "line",
      // The data for our dataset
      data: {
        datasets: this.chartDataSets,
      },

      // Configuration options go here
      options: {
        animation: false,
        onHover: (event: ChartEvent, activeElements: ActiveElement[]): void => {
          //@ts-ignore
          event.native.target.style.cursor = activeElements[0]
            ? "pointer"
            : "default";
        },
        onClick: (event: ChartEvent, activeElements: ActiveElement[]): void => {
          if (!activeElements[0]) return;
          let index = activeElements[0].index;
          let dataSetIndex = activeElements[0].datasetIndex;
          let dataSet = this.chartDataSets[dataSetIndex];
          if (!dataSet || !dataSet.data) return;
          const dataAtIndex = dataSet.data[index] as Point;
          const x = dataAtIndex.x;
          this.$emit("click-date", new Date(x));
        },

        hover: {
          mode: "nearest",
          intersect: true,
        },
        plugins: {
          filler: {
            propagate: true,
          },
          tooltip: {
            callbacks: {
              label: this.chartLabels,
            },
          },
          legend: {
            onClick: (e: ChartEvent, legendItem: LegendItem) => {
              if (
                legendItem.datasetIndex === null ||
                legendItem.datasetIndex === undefined
              )
                return;
              let ci = this.chart;
              let meta = ci.getDatasetMeta(legendItem.datasetIndex);
              meta.hidden = !ci.data.datasets[legendItem.datasetIndex].hidden;
              this.chartDataSets[legendItem.datasetIndex].hidden = meta.hidden;
              ci.update();
            },
            display: true,
            position: "top",
            labels: {
              filter: this.chartLabelFilter,
            },
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
        scales: {
          x: {
            offset: false,
            //@ts-ignore
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

          y: {
            ticks: {
              stepSize: 1,
            },
            beginAtZero: true,
          },
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

<style scoped></style>
