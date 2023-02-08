<template>
  <canvas height="140px" :width="width" :ref="(el) => (chartElement = el)" />
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  toRefs,
  watch,
} from "vue";
import {
  Chart,
  BarController,
  CategoryScale,
  BarElement,
  TimeScale,
  ChartEvent,
  ActiveElement,
  ScatterDataPoint,
  Tooltip,
  Legend,
  TooltipItem,
  LinearScale,
} from "chart.js";
import "chartjs-adapter-moment";

export type timeUnit = "day" | "hour";

const props = defineProps<{
  width: number;
  data: ScatterDataPoint[];
  unit: timeUnit;
}>();

const { data, unit } = toRefs(props);
const emit = defineEmits(["click-date"]);

let barChart: Chart | null = null;
const chartElement: Ref<HTMLCanvasElement | null> = ref(null);

const timeFormat = computed(() => {
  if (props.unit === "day") return "D-M-YYYY";
  else return "HH:mm";
});

const displayFormat = computed(() => {
  if (props.unit === "day") return { day: timeFormat.value };
  else return { hour: timeFormat.value };
});

watch(data, () => {
  if (!barChart) return;
  if (!barChart.data.datasets) return;
  barChart.data.datasets[0].data = data.value;
  barChart.data.datasets[0].backgroundColor = data.value.map((data) =>
    data.y === 100 ? "#5eba00" : "rgba(94, 186, 0, 0.5)"
  );
  barChart.data.datasets[1].data = data.value.map((data) => {
    return {
      x: data.x,
      y: 100 - data.y,
    };
  });
  barChart.update();
});

onMounted(() => {
  if (chartElement.value === null) return;
  const context = chartElement.value.getContext("2d");
  if (!context) return;
  Chart.register(
    BarController,
    CategoryScale,
    BarElement,
    TimeScale,
    Tooltip,
    Legend,
    LinearScale
  );

  barChart = new Chart(context, {
    type: "bar",
    data: {
      datasets: [
        {
          label: "Validating",
          backgroundColor: data.value.map((data) =>
            data.y === 100 ? "#5eba00" : "rgba(94, 186, 0, 0.5)"
          ),
          borderWidth: 0,
          data: data.value,
        },
        {
          label: "Not Validating",
          backgroundColor: "#cd201f",
          borderColor: "#1997c6",
          data: data.value.map((data) => {
            return {
              x: data.x,
              y: 100 - data.y,
            };
          }),
        },
      ],
    },

    // Configuration options go here
    options: {
      layout: {
        padding: 0,
      },
      onHover: (event: ChartEvent, activeElements: ActiveElement[]): void => {
        //@ts-ignore
        event.native.target.style.cursor = activeElements[0]
          ? "pointer"
          : "default";
      },
      onClick: (event: ChartEvent, activeElements: ActiveElement[]): void => {
        if (activeElements[0] && activeElements[0].index >= 0) {
          emit("click-date", data.value[activeElements[0].index].x);
        }
      },
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: (tooltipItem: TooltipItem<"bar">): string | string[] => {
              return " " + tooltipItem.formattedValue + "%";
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
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        x: {
          grid: {
            display: true,
            drawTicks: false,
            drawBorder: true,
            drawOnChartArea: false,
          },
          distribution: "linear",
          stacked: true,
          display: true,
          //@ts-ignore
          type: "time",
          time: {
            unit: unit.value,
            displayFormats: displayFormat.value,
            stepSize: 2,
          },
          ticks: {
            font: {
              size: 10,
            },
            color: "#aaa",
            padding: 2,
          },
          beginAtZero: true,
        },

        y: {
          grid: {
            display: true,
            drawTicks: false,
            drawBorder: true,
            drawOnChartArea: false,
          },
          min: 0,
          max: 100,
          stacked: true,
          display: true,
          bounds: "data",
          ticks: {
            padding: 0,
            font: {
              size: 8,
            },
            color: "#aaa",
            stepSize: 50,
            callback: function (value) {
              return value + "%";
            },
          },
          beginAtZero: true,
        },
      },
    },
  });
});

onBeforeUnmount(() => {
  if (barChart) {
    barChart.destroy();
  }
});
</script>

<style scoped></style>
