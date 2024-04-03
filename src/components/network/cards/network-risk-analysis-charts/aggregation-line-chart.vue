<template>
  <div class="w-100 h-100">
    <canvas :ref="(el) => (chartElement = el)"></canvas>
  </div>
</template>

<script setup lang="ts">
import {
  type ActiveElement,
  Chart,
  type ChartData,
  type ChartDataset,
  type ChartEvent,
  Filler,
  Legend,
  type LegendItem,
  LinearScale,
  LineController,
  LineElement,
  type Point,
  PointElement,
  TimeSeriesScale,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import "chartjs-adapter-date-fns";

import {
  type ComponentPublicInstance,
  onBeforeUnmount,
  onMounted,
  type Ref,
  ref,
  withDefaults,
} from "vue";

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

const chartElement: Ref<null | Element | ComponentPublicInstance> = ref(null);
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
    TimeSeriesScale,
    LineElement,
    LineController,
    Legend,
    Tooltip,
    LinearScale,
    PointElement,
    Filler,
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
        const index = activeElements[0].index;
        const dataSetIndex = activeElements[0].datasetIndex;
        const dataSet = props.chartDataSets[dataSetIndex];
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
        title: {
          display: false,
          text: "Quorum availability - liveness analysis",
          font: {
            size: 16,
          },
        },
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
            const ci = chart.value;
            if (!ci) return;
            const meta = ci.getDatasetMeta(legendItem.datasetIndex);
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

      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          offset: false,
          type: "timeseries",
          time: {
            unit: props.unit,
            displayFormats: props.timeDisplayFormats,
            tooltipFormat: props.tooltipTimeFormat,
          },
          grid: {
            offset: false,
            display: false,
          },
          ticks: {
            stepSize: props.stepSize,
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
