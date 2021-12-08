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
} from "chart.js";
import "chartjs-adapter-moment";
import useStore from "@/useStore";

export type timeUnit = "day" | "hour";

@Component({
  name: "bar-chart-day",
})
export default class BarChartDay extends Vue {
  @Prop()
  width!: string;
  @Prop()
  data!: ScatterDataPoint[];
  @Prop()
  unit!: timeUnit;

  barChart!: Chart;
  id: number = this.store.getUniqueId();

  get store(): Store {
    return useStore();
  }

  get timeFormat() {
    if (this.unit === "day") return "D-M-YYYY";
    else return "HH:mm";
  }

  get displayFormat() {
    if (this.unit === "day") return { day: this.timeFormat };
    else return { hour: this.timeFormat };
  }

  @Watch("data")
  onDataChanged() {
    if (!this.barChart.data.datasets) return;
    this.barChart.data.datasets[0].data = this.data;
    this.barChart.data.datasets[0].backgroundColor = this.data.map((data) =>
      data.y === 100 ? "#5eba00" : "rgba(94, 186, 0, 0.5)"
    );
    this.barChart.data.datasets[1].data = this.data.map((data) => {
      return {
        x: data.x,
        y: 100 - data.y,
      };
    });
    this.barChart.update();
  }

  mounted() {
    let chartId = "lineChart" + this.id;
    let context = (this.$refs[chartId] as HTMLCanvasElement).getContext("2d");
    Chart.register(
      BarController,
      CategoryScale,
      BarElement,
      TimeScale,
      Tooltip,
      Legend
    );
    this.barChart = new Chart(context as CanvasRenderingContext2D, {
      type: "bar",
      data: {
        datasets: [
          {
            label: "Validating",
            backgroundColor: this.data.map((data) =>
              data.y === 100 ? "#5eba00" : "rgba(94, 186, 0, 0.5)"
            ),
            borderWidth: 0,
            data: this.data,
          },
          {
            label: "Not Validating",
            backgroundColor: "#cd201f",
            borderColor: "#1997c6",
            data: this.data.map((data) => {
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
            this.$emit("click-date", this.data[activeElements[0].index].x);
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
              unit: this.unit,
              displayFormats: this.displayFormat,
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
  }

  public beforeDestroy() {
    if (this.barChart) {
      this.barChart.destroy();
    }
  }
}
</script>

<style scoped></style>
