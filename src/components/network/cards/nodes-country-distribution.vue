<template>
  <div class="card">
    <div class="text-muted mx-3 mt-3">Countries</div>
    <div class="card-body d-flex flex-row justify-content-center p-1">
      <div
        class="canvas-container"
        style="position: relative; height: 150px; width: 250px"
      >
        <canvas
          id="countryDistributionGraph"
          ref="countryDistributionGraph"
        ></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";

import { computed, onBeforeUnmount, onMounted, ref, Ref, watch } from "vue";

import Store from "@/store/Store";
import useStore from "@/store/useStore";

const chart: Ref<Chart | null> = ref(null);
const store: Store = useStore();
const network = store.network;

watch(() => store.includeWatcherNodes, onWatcherNodesOptionChanged);

function onWatcherNodesOptionChanged() {
  if (!chart.value || !chart.value.data.datasets) return;
  chart.value.data.datasets[0].data = chartData.value;
  chart.value.update();
}

const sortedCountries = computed(() => {
  const countries = network.nodes
    .filter(useStore().watcherNodeFilter)
    .filter((node) => node.geoData.countryName)
    .map((node) => node.geoData.countryName)
    .reduce(
      (
        accumulator: Record<string, number | undefined>,
        currentValue: string | null,
      ) => {
        if (currentValue === null) {
          return accumulator;
        }
        if (!accumulator[currentValue]) accumulator[currentValue] = 1;
        else (accumulator[currentValue] as number)++;
        return accumulator;
      },
      {},
    );

  const sortedCountries: [string, number][] = [];
  for (const countryName in countries) {
    if (countries[countryName])
      sortedCountries.push([countryName, countries[countryName] as number]);
  }

  return sortedCountries.sort(function (a, b) {
    return b[1] - a[1];
  });
});

const chartData = computed(() => {
  const countries = [];
  if (sortedCountries.value[0]) countries.push(sortedCountries.value[0][1]);
  if (sortedCountries.value[1]) countries.push(sortedCountries.value[1][1]);
  if (sortedCountries.value[2]) countries.push(sortedCountries.value[2][1]);
  if (sortedCountries.value[3])
    countries.push(
      sortedCountries.value.slice(3).reduce((accumulator, currentValue) => {
        return accumulator + currentValue[1];
      }, 0),
    );

  return countries;
});

const labels = computed(() => {
  const labels = [];
  if (sortedCountries.value[0]) labels.push(sortedCountries.value[0][0]);
  if (sortedCountries.value[1]) labels.push(sortedCountries.value[1][0]);
  if (sortedCountries.value[2]) labels.push(sortedCountries.value[2][0]);
  if (sortedCountries.value[3]) labels.push("Other");

  return labels;
});

const countryDistributionGraph: Ref<HTMLCanvasElement | null> = ref(null);

function initializeDoughnut() {
  if (countryDistributionGraph.value === null) return;

  if (sortedCountries.value.length === 0) {
    return;
  }
  const context = countryDistributionGraph.value.getContext("2d");
  if (!context) return;

  Chart.register(Tooltip, Legend, ArcElement, DoughnutController);
  chart.value = new Chart(context, {
    type: "doughnut",
    // The data for our dataset
    data: {
      labels: labels.value,
      datasets: [
        {
          label: "Node countries",
          backgroundColor: [
            "rgba(25, 151, 198,0.7)", // primary blue
            "rgba(27, 201, 141,0.7)", // success green
            "rgba(228, 216, 54,0.7)", // warning yellow
            "#e5e5e5",
          ],
          borderColor: [
            "rgba(25, 151, 198,1)", // primary blue
            "#1bc98e", // success green
            "#e4d836", // warning yellow
            "#e5e5e5",
          ],
          borderWidth: 0,
          data: chartData.value,
        },
      ],
    },

    // Configuration options go here
    options: {
      layout: {
        padding: {
          left: 0,
          right: 0,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      cutout: "50%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
      },
      animation: {
        duration: 0, // general animation time
      },
    },
  });
}

onMounted(() => {
  initializeDoughnut();
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<style scoped></style>
