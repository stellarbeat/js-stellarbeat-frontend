<template>
  <div class="card h-100">
    <div class="text-muted mx-3 mt-3">Versions</div>
    <div class="card-body d-flex flex-row justify-content-center p-1">
      <div
        class="canvas-container"
        style="position: relative; height: 150px; width: 200px"
      >
        <canvas id="versionGraph" ref="versionGraph" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArcElement,
  Chart,
  type ChartConfiguration,
  type ChartItem,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";

import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  type Ref,
  watch,
} from "vue";

import Store from "@/store/Store";
import useStore from "@/store/useStore";

const chart: Ref<Chart<"doughnut", number[], string> | null> = ref(null);
const store: Store = useStore();
const network = store.network;

watch(
  () => store.includeWatcherNodes,
  () => {
    if (!chart.value || !chart.value.data.datasets) return;
    chart.value.data.datasets[0].data = chartData.value;
    chart.value.update();
  },
);

const sortedVersions = computed(() => {
  const versions: Record<string, number | undefined> = network.nodes
    .filter(useStore().watcherNodeFilter)
    .filter((node) => node.versionStr)
    .map((node) =>
      (node.versionStr as string)
        .replace("stellar-core ", "")
        .replace("v", "")
        .replace(/ \(.*$/, "")
        .replace(/-.*$/, ""),
    )
    .reduce(
      (
        accumulator: Record<string, number | undefined>,
        currentValue: string,
      ) => {
        if (accumulator[currentValue] === undefined)
          accumulator[currentValue] = 1;
        else (accumulator[currentValue] as number)++;
        return accumulator;
      },
      {},
    );
  const sortedVersions: [string, number][] = [];
  for (const versionStr in versions) {
    if (versions[versionStr] !== undefined)
      sortedVersions.push([versionStr, versions[versionStr] as number]);
  }

  return sortedVersions.sort(function (
    a: [string, number],
    b: [string, number],
  ) {
    return b[1] - a[1];
  });
});

const chartData = computed(() => {
  const countries: number[] = [];
  if (sortedVersions.value[0]) countries.push(sortedVersions.value[0][1]);
  if (sortedVersions.value[1]) countries.push(sortedVersions.value[1][1]);
  if (sortedVersions.value[2]) countries.push(sortedVersions.value[2][1]);
  if (sortedVersions.value[3])
    countries.push(
      sortedVersions.value.slice(3).reduce((accumulator, currentValue) => {
        return accumulator + currentValue[1];
      }, 0),
    );

  return countries;
});

const labels = computed(() => {
  const labels: string[] = [];
  if (sortedVersions.value[0]) labels.push(sortedVersions.value[0][0]);
  if (sortedVersions.value[1]) labels.push(sortedVersions.value[1][0]);
  if (sortedVersions.value[2]) labels.push(sortedVersions.value[2][0]);
  if (sortedVersions.value[3]) labels.push("Other");

  return labels;
});

const versionGraph: Ref<ChartItem | null> = ref(null);
function initializeDoughnut() {
  if (versionGraph.value === null) return;

  Chart.register(Tooltip, ArcElement, DoughnutController, Legend);

  const config: ChartConfiguration<"doughnut", number[], string> = {
    type: "doughnut",
    data: {
      labels: labels.value,
      datasets: [
        {
          label: "Node versions",
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
  };
  chart.value = new Chart(versionGraph.value, config);
}

onMounted(function () {
  initializeDoughnut();
});

onBeforeUnmount(function () {
  if (chart.value) chart.value.destroy();
});
</script>

<style scoped></style>
