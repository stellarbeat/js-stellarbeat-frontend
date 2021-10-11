<template>
  <div class="card h-100">
    <div class="text-muted mx-3 mt-3">Versions</div>
    <div class="card-body d-flex flex-row justify-content-center p-1">
      <div class="canvas-container">
        <canvas id="versionGraph" ref="versionGraph" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Chart from "chart.js";

import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";

import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";

@Component({
  name: "nodes-versions",
})
export default class NodesVersions extends Vue {
  public chart: Chart | null = null;

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  @Watch("store.includeWatcherNodes")
  protected onWatcherNodesOptionChanged() {
    this.chart!.data.datasets![0].data = this.chartData;
    this.chart!.update();
  }

  get sortedVersions() {
    let versions = this.network.nodes
      .filter(this.$root.$data.store.watcherNodeFilter)
      .filter((node) => node.versionStr)
      .map((node) =>
        node
          .versionStr!.replace("stellar-core ", "")
          .replace("v", "")
          .replace(/ \(.*$/, "")
          .replace(/-.*$/, "")
      )
      .reduce((accumulator: any, currentValue: string) => {
        if (accumulator[currentValue] === undefined)
          accumulator[currentValue] = 1;
        else accumulator[currentValue]++;
        return accumulator;
      }, {});

    let sortedVersions = [];
    for (let versionStr in versions) {
      sortedVersions.push([versionStr, versions[versionStr]]);
    }

    return sortedVersions.sort(function (a: Array<number>, b: Array<number>) {
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
            ],
            borderColor: [
              "rgba(25, 151, 198,1)", // primary blue
              "#1bc98e", // success green
              "#e4d836", // warning yellow
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
            left: 20,
            right: 20,
          },
        },
        title: {
          text: "Node versions",
          display: false,
          fontSize: 20,
        },
        responsive: true,
        maintainAspectRatio: true,
        cutoutPercentage: 50,
        legend: {
          display: true,
          position: "bottom",
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
