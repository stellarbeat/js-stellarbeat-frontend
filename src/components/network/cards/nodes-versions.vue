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

<script lang="ts">
import {
  Chart,
  ArcElement,
  DoughnutController,
  Legend,
  Tooltip,
} from "chart.js";

import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";

import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import useStore from "@/useStore";

@Component({
  name: "nodes-versions",
})
export default class NodesVersions extends Vue {
  public chart: Chart | null = null;

  get store(): Store {
    return useStore();
  }

  get network(): Network {
    return this.store.network;
  }

  @Watch("store.includeWatcherNodes")
  protected onWatcherNodesOptionChanged() {
    if (!this.chart || !this.chart.data.datasets) return;
    this.chart.data.datasets[0].data = this.chartData;
    this.chart.update();
  }

  get sortedVersions() {
    let versions: Record<string, number | undefined> = this.network.nodes
      .filter(useStore().watcherNodeFilter)
      .filter((node) => node.versionStr)
      .map((node) =>
        (node.versionStr as string)
          .replace("stellar-core ", "")
          .replace("v", "")
          .replace(/ \(.*$/, "")
          .replace(/-.*$/, "")
      )
      .reduce(
        (
          accumulator: Record<string, number | undefined>,
          currentValue: string
        ) => {
          if (accumulator[currentValue] === undefined)
            accumulator[currentValue] = 1;
          else (accumulator[currentValue] as number)++;
          return accumulator;
        },
        {}
      );

    let sortedVersions: [string, number][] = [];
    for (let versionStr in versions) {
      if (versions[versionStr] !== undefined)
        sortedVersions.push([versionStr, versions[versionStr] as number]);
    }

    return sortedVersions.sort(function (
      a: [string, number],
      b: [string, number]
    ) {
      return b[1] - a[1];
    });
  }

  get chartData() {
    let countries = [];
    if (this.sortedVersions[0]) countries.push(this.sortedVersions[0][1]);
    if (this.sortedVersions[1]) countries.push(this.sortedVersions[1][1]);
    if (this.sortedVersions[2]) countries.push(this.sortedVersions[2][1]);
    if (this.sortedVersions[3])
      countries.push(
        this.sortedVersions.slice(3).reduce((accumulator, currentValue) => {
          return accumulator + currentValue[1];
        }, 0)
      );

    return countries;
  }

  get labels() {
    let labels = [];
    if (this.sortedVersions[0]) labels.push(this.sortedVersions[0][0]);
    if (this.sortedVersions[1]) labels.push(this.sortedVersions[1][0]);
    if (this.sortedVersions[2]) labels.push(this.sortedVersions[2][0]);
    if (this.sortedVersions[3]) labels.push("Other");

    return labels;
  }

  initializeDoughnut() {
    let context = (this.$refs.versionGraph as HTMLCanvasElement).getContext(
      "2d"
    );
    Chart.register(Tooltip, ArcElement, DoughnutController, Legend);
    this.chart = new Chart(context as CanvasRenderingContext2D, {
      type: "doughnut",
      data: {
        labels: this.labels,
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
            data: this.chartData,
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

  mounted() {
    this.initializeDoughnut();
  }

  beforeDestroy() {
    if (this.chart) this.chart.destroy();
  }
}
</script>

<style scoped>
.canvas-container {
}
</style>
