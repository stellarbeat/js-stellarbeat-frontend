<template>
  <div class="w-100 h-100">
    <canvas
      :id="'networkStatisticsChart' + id"
      :ref="'networkStatisticsChart' + id"
    >
    </canvas>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from "vue-property-decorator";
import { BTooltip, BIconInfoCircle } from "bootstrap-vue";
import {
  ActiveElement,
  Chart,
  ChartEvent,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeScale,
  TooltipItem,
} from "chart.js";
import "chartjs-adapter-moment";
import { StoreMixin } from "@/mixins/StoreMixin";
import NetworkStatisticsAggregation from "@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation";

@Component({
  components: { BTooltip, BIconInfoCircle },
})
export default class NetworkStatisticsChart extends Mixins(StoreMixin) {
  public chart!: Chart;
  protected id!: number;

  @Prop()
  yearStatistics!: NetworkStatisticsAggregation[];

  @Prop()
  statsProperty!: string;

  public created() {
    this.id = this.store.getUniqueId();
  }

  public async mounted() {
    this.initializeBarChart();
  }

  getAggregatedDataSets(statisticsAggregation: NetworkStatisticsAggregation[]) {
    return [
      {
        fill: "origin",
        tension: 0.5,
        borderColor: "rgba(25, 151, 198,1)",
        backgroundColor: "rgba(25, 151, 198,0.3)", // primary blue
        borderWidth: 2,
        steppedLine: false,
        data: statisticsAggregation.map((stat) => {
          if (stat.crawlCount === 0) return {};
          return {
            x: stat.time,
            //@ts-ignore
            y:
              stat.crawlCount !== 0
                ? //@ts-ignore
                  Math.round(stat[this.statsProperty])
                : 0.1,
          };
        }),
      },
    ];
  }

  public initializeBarChart() {
    const chartId = "networkStatisticsChart" + this.id;
    const context = this.$refs[chartId];
    Chart.register(
      Filler,
      PointElement,
      LineController,
      LineElement,
      LinearScale,
      TimeScale
    );
    //@ts-ignore
    this.chart = new Chart(context as HTMLCanvasElement, {
      type: "line",
      // The data for our dataset
      data: {
        datasets: this.getAggregatedDataSets(this.yearStatistics),
      },

      // Configuration options go here
      options: {
        onHover: (event: ChartEvent, activeElements: ActiveElement[]): void => {
          //@ts-ignore
          event.native.target.style.cursor = "pointer";
          if (activeElements.length === 1 && activeElements[0]) {
            this.$emit("hover", this.yearStatistics[activeElements[0].index]);
          } else this.$emit("hover", null);
        },
        hover: {
          mode: "nearest",
          intersect: false,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
            mode: "index",
            intersect: false,
            caretSize: 0,
            displayColors: false,
            callbacks: {
              title: function () {
                //Return value for title
                return "";
              },
              label: function (tooltipItem: TooltipItem<"line">) {
                return tooltipItem.label + ": " + tooltipItem.formattedValue;
              },
            },
          },
        },
        elements: {
          point: {
            radius: 0,
          },
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 4,
            bottom: 0,
          },
        },
        title: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,

        animation: {
          duration: 0, // general animation time
        },
        scales: {
          x: {
            offset: false,
            display: false,
            //@ts-ignore
            type: "time",
            distribution: "series",
            time: {
              unit: "year",
              stepSize: 1,
              tooltipFormat: "MMM YYYY",
            },
          },
          y: {
            display: false,
            ticks: {
              stepSize: 12,
            },
            beginAtZero: false,
          },
        },
      },
    });
  }
  public beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
</script>

<style scoped></style>
