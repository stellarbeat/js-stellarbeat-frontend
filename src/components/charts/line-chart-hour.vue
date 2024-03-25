<template>
  <canvas height="140px" :width="width" :ref="(el) => (chartElement = el)" />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from "vue";
import {
  ActiveElement,
  Chart,
  ChartEvent,
  Filler,
  LineController,
  LineElement,
  PointElement,
  ScatterDataPoint,
  TooltipItem,
} from "chart.js";

interface Props {
  width: number;
  data: ScatterDataPoint[];
  inverted?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  inverted: false,
});
const { data, inverted, width } = toRefs(props);

const emit = defineEmits(["click-date"]);

const chartElement = ref<HTMLCanvasElement | null>(null);
let lineChart: Chart | null = null;

watch(data, () => {
  if (!lineChart) return;
  if (!lineChart?.data.datasets) return;
  lineChart.data.datasets[0].data = data.value;
  if (!props.inverted) {
    //@ts-ignore
    lineChart.data.datasets[0].pointBackgroundColor = pointColors.value;
    //@ts-ignore
    lineChart.data.datasets[0].pointBorderColor = pointColors.value;
  } else {
    //@ts-ignore
    lineChart.data.datasets[0].pointBackgroundColor = pointColors.value;
    //@ts-ignore
    lineChart.data.datasets[0].pointBorderColor = pointColors.value;
  }

  lineChart.update();
});

const pointColors = computed(() => {
  if (!props.inverted) {
    return data.value.map((point) =>
      point.y ? "rgba(94,186,0,1)" : "#cd201f",
    );
  } else {
    return data.value.map((point) =>
      point.y ? "#cd201f" : "rgba(94,186,0,1)",
    );
  }
});

onMounted(() => {
  if (!chartElement.value) return;
  const context = chartElement.value.getContext("2d");
  Chart.register(LineController, LineElement, PointElement, Filler);
  lineChart = new Chart(context as CanvasRenderingContext2D, {
    type: "line",
    data: {
      datasets: [
        {
          label: "Validating",
          fill: {
            target: "origin",
          },
          backgroundColor: inverted.value
            ? "rgba(255,0,0,0.4)"
            : "rgba(94,186,0,0.4)",
          pointBackgroundColor: pointColors.value,
          pointBorderColor: pointColors.value,
          pointBorderWidth: 2,
          borderColor: inverted.value ? "red" : "rgba(25,186,0,1)",
          borderWidth: 3,
          data: data.value,
        },
      ],
    },

    // Configuration options go here
    options: {
      onHover(event: ChartEvent, activeElements: ActiveElement[]) {
        //@ts-ignore
        event.native.target.style.cursor = activeElements[0]
          ? "pointer"
          : "default";
      },
      onClick: (event: ChartEvent, activeElements: ActiveElement[]): void => {
        if (activeElements[0] && activeElements[0].index >= 0)
          emit("click-date", data.value[activeElements[0].index].x);
      },
      plugins: {
        tooltip: {
          callbacks: {
            label(tooltipItem: TooltipItem<"line">): string | string[] {
              return tooltipItem.formattedValue === "1" ? "Yes" : "No";
            },
          },
        },
        legend: {
          display: false,
        },
      },

      responsive: false,

      animation: {
        duration: 0, // general animation time
      },
      responsiveAnimationDuration: 0, // animation duration after a resize
      scales: {
        x: {
          border: {
            display: true,
          },
          grid: {
            display: true,
            drawTicks: false,
            drawOnChartArea: false,
          },
          stacked: true,
          display: true,
          //@ts-ignore
          type: "time",
          time: {
            unit: "minute",
            displayFormats: {
              minute: "HH:mm",
            },
          },
          distribution: "series",
          ticks: {
            font: {
              size: 10,
            },
            padding: 8,
          },
          beginAtZero: true,
        },
        y: {
          border: {
            display: true,
          },
          grid: {
            display: true,
            drawTicks: false,
            drawOnChartArea: false,
          },
          stacked: true,
          display: true,
          bounds: "data",
          ticks: {
            padding: 8,
            font: {
              size: 10,
            },
            stepSize: 10,
            callback: function (value) {
              return value ? "Yes" : "No";
            },
          },
          beginAtZero: true,
        },
      },
    },
  });
});

onBeforeUnmount(() => {
  if (!lineChart) return;
  lineChart.destroy();
});
</script>
