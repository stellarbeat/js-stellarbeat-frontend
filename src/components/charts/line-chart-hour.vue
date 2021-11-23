<template>
  <canvas
    height="140px"
    :width="width"
    :id="'lineChart' + id"
    :ref="'lineChart' + id"
  />
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator";
import Store from "@/store/Store";
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

@Component({
  name: "line-chart-hour",
})
export default class LineChartHour extends Vue {
  @Prop()
  width!: string;
  @Prop()
  data!: ScatterDataPoint[];
  @Prop({ default: false })
  inverted!: boolean;

  lineChart!: Chart;
  id: number = this.store.getUniqueId();

  get store(): Store {
    return this.$root.$data.store;
  }

  @Watch("data")
  onDataChanged() {
    if (!this.lineChart.data.datasets) return;
    this.lineChart.data.datasets[0].data = this.data;
    if (!this.inverted) {
      //@ts-ignore
      this.lineChart.data.datasets[0].pointBackgroundColor = this.pointColors;
      //@ts-ignore
      this.lineChart.data.datasets[0].pointBorderColor = this.pointColors;
    } else {
      //@ts-ignore
      this.lineChart.data.datasets[0].pointBackgroundColor = this.pointColors;
      //@ts-ignore
      this.lineChart.data.datasets[0].pointBorderColor = this.pointColors;
    }

    this.lineChart.update();
  }

  get pointColors() {
    if (!this.inverted) {
      return this.data.map((point) =>
        point.y ? "rgba(94,186,0,1)" : "#cd201f"
      );
    } else {
      return this.data.map((point) =>
        point.y ? "#cd201f" : "rgba(94,186,0,1)"
      );
    }
  }

  mounted() {
    let chartId = "lineChart" + this.id;
    let context = (this.$refs[chartId] as HTMLCanvasElement).getContext("2d");
    Chart.register(LineController, LineElement, PointElement, Filler);
    this.lineChart = new Chart(context as CanvasRenderingContext2D, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Validating",
            fill: {
              target: "origin",
            },
            backgroundColor: this.inverted
              ? "rgba(255,0,0,0.4)"
              : "rgba(94,186,0,0.4)",
            pointBackgroundColor: this.pointColors,
            pointBorderColor: this.pointColors,
            pointBorderWidth: 2,
            borderColor: this.inverted ? "red" : "rgba(25,186,0,1)",
            borderWidth: 3,
            data: this.data,
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
            this.$emit(
              "click-date",
              //@ts-ignore
              this.data[activeElements[0].index].x.getTime()
            );
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
            grid: {
              display: true,
              drawTicks: false,
              drawBorder: true,
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
  }
  public beforeDestroy() {
    if (this.lineChart) {
      this.lineChart.destroy();
    }
  }
}
</script>

<style scoped></style>
