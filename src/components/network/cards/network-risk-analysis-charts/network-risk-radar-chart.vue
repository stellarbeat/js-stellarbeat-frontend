<template>
  <div class="card" style="height: 320px" :class="dimmerClass">
    <div class="mx-4 mt-4 my-header">
      <div class="text-muted">Network analysis</div>
      <button
        data-toggle="modal"
        data-target="#infoModal"
        type="button"
        class="btn btn-secondary btn-sm info"
      >
        <b-icon-info-circle v-tooltip:top="'Info'" class="text-muted" />
      </button>
    </div>
    <div class="loader"></div>
    <div class="card-body d-flex flex-row justify-content-center p-1 my-body">
      <div class="canvas-container">
        <canvas :ref="(el) => (chartElement = el)"></canvas>
      </div>
    </div>

    <div
      id="infoModal"
      ref="infoModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="modalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-body">
            <h3>What does this chart show?</h3>
            <p class="my-4">
              This chart shows liveness and safety buffers for the whole
              network. For example if the node liveness data point shows that a
              set of two nodes is found, this means that two specific nodes
              could halt the network if they fail. If you want to find out what
              these nodes are, click on a datapoint and run the network
              analysis.
            </p>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <p>
              Powered by
              <a
                target="_blank"
                rel="noopener"
                href="https://github.com/wiberlin/fbas_analyzer"
              >
                wiberlin/fbas_analyzer
              </a>
            </p>
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  type ActiveElement,
  Chart,
  type ChartEvent,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  type TooltipItem,
} from "chart.js";

import {
  type ComponentPublicInstance,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

import { BIconInfoCircle } from "bootstrap-vue";
import { AutomaticNetworkAnalysis } from "@/services/NetworkAnalyzer";
import useStore from "@/store/useStore";
import { MergeBy } from "@stellarbeat/stellar_analysis_web";
import useScrollTo from "@/composables/useScrollTo";

const chart = ref<Chart>();
const store = useStore();
const network = store.network;
const chartElement = ref<null | Element | ComponentPublicInstance>();
const scrollTo = useScrollTo();

watch(
  () => store.networkAnalyzer.automaticState,
  (newValue, oldValue) => {
    if (!chart.value) return;
    if (
      newValue === AutomaticNetworkAnalysis.Done &&
      oldValue !== AutomaticNetworkAnalysis.Done
    ) {
      chart.value.data.datasets[0].data = [
        network.networkStatistics.minBlockingSetOrgsFilteredSize as number,
        network.networkStatistics.minBlockingSetFilteredSize,
        network.networkStatistics.minBlockingSetCountryFilteredSize as number,
        network.networkStatistics.minBlockingSetISPFilteredSize as number,
      ];
      chart.value.data.datasets[1].data = [
        network.networkStatistics.minSplittingSetOrgsSize as number,
        network.networkStatistics.minSplittingSetSize as number,
        network.networkStatistics.minSplittingSetCountrySize as number,
        network.networkStatistics.minSplittingSetISPSize as number,
      ];
      chart.value.update();
    }
  },
);

const dimmerClass = computed(() => {
  return {
    dimmer: true,
    active: store.networkAnalyzer.analyzing,
  };
});

function initializeChart() {
  Chart.register(
    RadialLinearScale,
    LineElement,
    RadarController,
    RadialLinearScale,
    PointElement,
    Filler,
  );
  //@ts-ignore
  chart.value = new Chart(chartElement.value as HTMLCanvasElement, {
    type: "radar",
    data: {
      labels: ["Organization", "Node", "Country", "ISP"],
      datasets: [
        {
          label: "Liveness",
          data: [
            network.networkStatistics.minBlockingSetOrgsFilteredSize,
            network.networkStatistics.minBlockingSetFilteredSize,
            network.networkStatistics.minBlockingSetCountryFilteredSize,
            network.networkStatistics.minBlockingSetISPFilteredSize,
          ],
          fill: true,
          borderColor: "rgba(25, 151, 198,1)",
          backgroundColor: "rgba(25, 151, 198, 0.1)",
        },
        {
          label: "Safety",
          data: [
            network.networkStatistics.minSplittingSetOrgsSize,
            network.networkStatistics.minSplittingSetSize,
            network.networkStatistics.minSplittingSetCountrySize,
            network.networkStatistics.minSplittingSetISPSize,
          ],
          fill: true,
          borderColor: "rgb(159, 134, 255)",
          backgroundColor: "rgba(159, 134, 255, 0.1)",
        },
      ],
    },

    // Configuration options go here
    options: {
      animation: false,
      onHover(event: ChartEvent, activeElements: ActiveElement[]) {
        //@ts-ignore
        event.native.target.style.cursor = activeElements[0]
          ? "pointer"
          : "default";
      },
      onClick: (event: ChartEvent, activeElements: ActiveElement[]): void => {
        if (activeElements[0] && activeElements[0].index >= 0) {
          switch (activeElements[0].index) {
            case 0:
              store.networkAnalysisMergeBy = MergeBy.Orgs;
              break;
            case 1:
              store.networkAnalysisMergeBy = MergeBy.DoNotMerge;
              break;
            case 2:
              store.networkAnalysisMergeBy = MergeBy.Countries;
              break;
            case 3:
              store.networkAnalysisMergeBy = MergeBy.ISPs;
              break;
          }
          if (!store.isNetworkAnalysisVisible)
            store.isNetworkAnalysisVisible = true;
          else scrollTo("network-analysis-card");
        }
      },
      layout: {
        padding: {
          left: 0,
          right: 0,
          bottom: 0,
          top: 10,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
        tooltip: {
          enabled: true,
          yAlign: "bottom",
          callbacks: {
            title: function (
              tooltipItems: TooltipItem<"radar">[],
            ): string | string[] {
              return tooltipItems[0].label;
            },
            label: (tooltipItem: TooltipItem<"radar">) => {
              const size = tooltipItem.dataset.data[tooltipItem.dataIndex];
              const type =
                tooltipItem.datasetIndex === 0 ? "liveness" : "safety";
              return `Set of size ${size} found that could impact ${type}`;
            },
          },
        },
      },
    },
  });
}

onMounted(() => {
  initializeChart();
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});
</script>

<style scoped>
.my-header {
  display: flex;
  justify-content: space-between;
}
</style>
