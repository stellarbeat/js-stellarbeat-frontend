<template>
  <div class="w-100 h-100">
    <canvas :ref="(el) => (chartElement = el)"></canvas>
  </div>
</template>

<script setup lang="ts">
import {
  ActiveElement,
  Chart,
  ChartData,
  ChartDataset,
  ChartEvent,
  Legend,
  LegendItem,
  LinearScale,
  LineController,
  LineElement,
  Point,
  PointElement,
  TimeScale,
  Tooltip,
  TooltipItem,
} from "chart.js";
import "chartjs-adapter-date-fns";

import { onBeforeUnmount, onMounted, ref, withDefaults } from "vue";

const chart = ref<Chart>();

export interface Props {
  isYearly?: boolean;
  chartDataSets: ChartDataset[];
  chartLabels: (tooltipItem: TooltipItem<"line">) => string;
  chartLabelFilter?:
    | ((item: LegendItem, data: ChartData) => boolean)
    | undefined;
  unit?:
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
  stepSize?: number;
  timeDisplayFormats: Record<string, string>;
  tooltipTimeFormat: string;
}

const props = withDefaults(defineProps<Props>(), {
  isYearly: false,
  chartLabelFilter: undefined,
  unit: "minute",
  stepSize: 2,
});

const chartElement = ref(null);
const emit = defineEmits(["click-date"]);

function updateData() {
  if (!chart.value) return;
  chart.value.data.datasets = props.chartDataSets;
  chart.value.update();
}
defineExpose({ updateData });

function initializeBarChart() {
  if (!chartElement.value) return;
  Chart.register(
    TimeScale,
    LineElement,
    LineController,
    Legend,
    Tooltip,
    LinearScale,
    PointElement
  );
  chart.value = new Chart(chartElement.value as HTMLCanvasElement, {
    type: "line",
    // The data for our dataset
    data: {
      datasets: props.chartDataSets,
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
        let dataSet = props.chartDataSets[dataSetIndex];
        if (!dataSet || !dataSet.data) return;
        const dataAtIndex = dataSet.data[index] as Point;
        const x = dataAtIndex.x;
        emit("click-date", new Date(x));
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
            label: props.chartLabels,
          },
        },
        legend: {
          onClick: (e: ChartEvent, legendItem: LegendItem) => {
            if (legendItem.datasetIndex === undefined) return;
            let ci = chart.value;
            if (!ci) return;
            let meta = ci.getDatasetMeta(legendItem.datasetIndex);
            meta.hidden = !meta.hidden;
            ci.update();
          },
          display: true,
          position: "top",
          labels: {
            filter: props.chartLabelFilter,
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
            unit: props.unit,
            stepSize: props.stepSize,
            displayFormats: props.timeDisplayFormats,
            tooltipFormat: props.tooltipTimeFormat,
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

onMounted(() => {
  initializeBarChart();
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<style scoped></style>
