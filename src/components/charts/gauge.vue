<template>
  <div class="d-flex flex-column align-items-center">
    <div class="relative">
      <canvas :ref="(el) => setGaugeRef(el)" :height="height" :width="width" />
      <div class="absolute-center text-center">
        {{ centerText }}
      </div>
    </div>
    <div class="title">
      {{ title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type ComponentPublicInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  toRefs,
  watch,
} from "vue";
import { ArcElement, Chart, DoughnutController, LinearScale } from "chart.js";

const props = defineProps({
  width: { type: String, required: true },
  height: { type: String, required: true },
  value: { type: Number, required: true },
  valueColor: { type: String, default: "#1997c6" },
  negativeValueColor: { type: String, default: "#e6e5e5" },
  maxValue: { type: Number, required: true },
  title: { type: String, required: false, default: undefined },
  centerText: { type: String, required: false, default: undefined },
});
const {
  width,
  height,
  value,
  valueColor,
  negativeValueColor,
  maxValue,
  title,
} = toRefs(props);

const chartElement = ref<HTMLCanvasElement | null>(null);
let chart: Chart<"doughnut", number[], string> | null = null;
const setGaugeRef = (el: Element | ComponentPublicInstance | null): void => {
  chartElement.value = el as HTMLCanvasElement | null;
};

watch(value, () => {
  if (!chart) return;
  if (!chart.data.datasets) return;
  chart.data.datasets[0].data = [
    value.value,
    Math.round((maxValue.value - value.value) * 100) / 100,
  ];

  chart.update();
});

onMounted(() => {
  if (!chartElement.value) return;

  Chart.register(DoughnutController, ArcElement, LinearScale);
  chart = new Chart(chartElement.value, {
    type: "doughnut",
    data: {
      datasets: [
        {
          label: title?.value,
          backgroundColor: [valueColor?.value, negativeValueColor?.value],
          data: [
            value?.value,
            Math.round((maxValue?.value - value?.value) * 100) / 100,
          ],
        },
      ],
      labels: [title?.value, ""],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
      animation: {
        duration: 0, // general animation time
      },
      hover: {
        mode: undefined,
      },
      responsive: false,
      cutout: "75%",
      maintainAspectRatio: true,
    },
  });
  chart.options.animation = false; // disables all animations
});

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy();
  }
});
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
