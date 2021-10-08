<template>
  <div class="card">
    <div class="card-header px-3 d-flex flex-wrap justify-content-between">
      <div class="d-flex flex-wrap">
        <b-button-group size="sm" class="mr-3">
          <b-button :pressed="bucketSize === '1Y'" @click="select1YView"
            >1Y</b-button
          >
          <b-button :pressed="bucketSize === '30D'" @click="select30DayView"
            >30D</b-button
          >
          <b-button :pressed="bucketSize === '24H'" @click="select24HView"
            >24H</b-button
          >
        </b-button-group>
        <h1 class="card-title">
          {{ capitalizeFirstLetter(analysisType) }} risk
        </h1>
      </div>
      <b-button size="sm" @click="showModal = true">
        <b-icon-info-circle
          v-b-modal="'modal-info-' + setType"
          v-b-tooltip:hover.top="'Info'"
          class="text-muted"
        />
      </b-button>
      <b-modal title="Info" ok-only hide-header v-model="showModal">
        <slot name="info"></slot>
        <template v-slot:modal-footer>
          <div class="w-100">
            <p class="float-left">
              Powered by
              <a
                target="_blank"
                rel="noopener"
                href="https://github.com/wiberlin/fbas_analyzer"
                >wiberlin/fbas_analyzer</a
              >
            </p>
            <b-button
              variant="primary"
              size="sm"
              class="float-right"
              @click="showModal = false"
            >
              Close
            </b-button>
          </div>
        </template>
      </b-modal>
    </div>
    <div v-if="failed" class="card-alert alert alert-danger mb-0">
      <b-icon-exclamation-triangle />
      Error fetching data
    </div>
    <div
      class="
        card-body
        d-flex
        flex-column
        justify-content-center
        align-items-center
        h-100
        px-0
        pt-0
        pb-3
      "
    >
      <div class="w-100 h-100" :class="dimmerClass">
        <div class="loader"></div>
        <div
          v-if="initialDataLoaded"
          style="height: 240px"
          class="dimmer-content"
        >
          <aggregation-line-chart
            ref="yearChart"
            v-if="bucketSize === '1Y'"
            :chartDataSets="aggregatedDataSets"
            :chartLabels="getAggregatedLabels"
            :unit="'month'"
            :tooltip-time-format="'MMM YYYY'"
            :time-display-formats="{ month: 'MMM YYYY' }"
            :step-size="1"
            :chartLabelFilter="aggregatedChartLabelFilter"
            :key="'1'"
            @click-date="select30DayView"
          />
          <aggregation-line-chart
            ref="monthChart"
            v-if="bucketSize === '30D'"
            :chartDataSets="aggregatedDataSets"
            :chartLabels="getAggregatedLabels"
            :unit="'day'"
            :tooltip-time-format="'D-M-YYYY'"
            :time-display-formats="{ day: 'D-M-YYYY' }"
            :step-size="2"
            :chartLabelFilter="aggregatedChartLabelFilter"
            :key="'2'"
            @click-date="select24HView"
          />
          <aggregation-line-chart
            ref="dayChart"
            v-if="bucketSize === '24H'"
            :unit="'minute'"
            :tooltip-time-format="'D-M-YYYY HH:mm'"
            :time-display-formats="{ minute: 'HH:mm' }"
            :step-size="4"
            point-radius="0"
            :chart-data-sets="hour24ChartDataSets"
            :chartLabels="getLabels"
            :key="'3'"
            @click-date="updateSelectedDateAndHighlight"
          />
        </div>
      </div>
      <div
        class="d-flex flex-wrap mt-1"
        :class="{ animated: animated }"
        @animationend="animated = false"
      >
        <date-navigator
          v-if="initialDataLoaded"
          :minSelectedDate="
            statisticsDateTimeNavigator.getMinSelectedDate(bucketSize)
          "
          :selectedDate="selectedDate"
          v-on:dateChanged="updateSelectedDate"
          :bucket-size="bucketSize"
          :showTime="bucketSize === '24H'"
          class="mr-1 mb-0 mt-1"
        />
      </div>
    </div>
    <!--div class="card-footer">
            Powered by <a href="https://github.com/wiberlin/fbas_analyzer">@wiberlin/fbas_analyzer</a>
        </div!-->
  </div>
</template>

<script lang="ts">
import {
  ChartData,
  ChartDataSets,
  ChartLegendLabelItem,
  ChartTooltipItem,
} from "chart.js";
import { Component, Mixins, Prop } from "vue-property-decorator";
import {
  BButton,
  BButtonGroup,
  BIconExclamationCircle,
  BIconExclamationTriangle,
  BIconInfoCircle,
  BModal,
  BTooltip,
  VBModal,
  VBTooltip,
} from "bootstrap-vue";
import DateNavigator from "@/components/date-navigator.vue";
import moment from "moment";
import NetworkStatisticsAggregation from "@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation";
import AggregationLineChart from "@/components/network/cards/network-risk-analysis-charts/aggregation-line-chart.vue";
import StatisticsDateTimeNavigator from "@/components/network/cards/network-risk-analysis-charts/StatisticsDateTimeNavigator";
import { IsLoadingMixin } from "@/mixins/IsLoadingMixin";
import { StoreMixin } from "@/mixins/StoreMixin";
import NetworkStatistics from "@stellarbeat/js-stellar-domain/lib/network-statistics";

@Component({
  components: {
    AggregationLineChart,
    DateNavigator,
    BTooltip,
    BIconInfoCircle,
    BButton,
    BButtonGroup,
    BIconExclamationCircle,
    BModal,
    BIconExclamationTriangle,
  },
  directives: { "b-tooltip": VBTooltip, "b-modal": VBModal },
})
export default class NetworkAnalysis extends Mixins(
  IsLoadingMixin,
  StoreMixin
) {
  @Prop()
  analysisType!: string; //safety or liveness

  @Prop({ default: "1Y" })
  defaultBucketSize!: string;

  protected selectedDate!: Date;
  protected yearStatistics: NetworkStatisticsAggregation[] = [];
  protected days30Statistics: NetworkStatisticsAggregation[] = [];
  protected hour24Statistics: NetworkStatistics[] = [];
  protected initialDataLoaded = false;
  protected statisticsDateTimeNavigator!: StatisticsDateTimeNavigator;
  protected bucketSize!: string;
  protected failed = false;
  animated = false;
  protected showModal = false;
  protected aggregatedDataSets!: ChartDataSets[];
  protected hour24ChartDataSets: ChartDataSets[] | undefined;

  get setType() {
    return this.analysisType === "safety" ? "splitting" : "blocking";
  }

  get canBeFiltered() {
    return this.setType === "blocking";
  }

  async updateSelectedDate(newDate: Date) {
    this.selectedDate = newDate;
    if (this.bucketSize === "1Y") await this.updateYearChart();
    if (this.bucketSize === "30D") await this.updateDays30Chart();
    if (this.bucketSize === "24H") await this.updateHours24Chart();
  }

  updateHiddenStatus(toBucketSize: string) {
    if (this.bucketSize === "24H") {
      this.aggregatedDataSets[0].hidden = this.hour24ChartDataSets![0].hidden!;
      this.aggregatedDataSets[3].hidden = this.hour24ChartDataSets![1].hidden!;
      this.aggregatedDataSets[6].hidden = this.hour24ChartDataSets![2]
        ? this.hour24ChartDataSets![2].hidden!
        : false;
      this.aggregatedDataSets[9].hidden = this.hour24ChartDataSets![3]
        ? this.hour24ChartDataSets![3].hidden!
        : false;
    }
    if (toBucketSize === "24H") {
      this.hour24ChartDataSets![0].hidden! = this.aggregatedDataSets[0].hidden!;
      this.hour24ChartDataSets![1].hidden! = this.aggregatedDataSets[3].hidden!;
      this.hour24ChartDataSets![2].hidden! = this.aggregatedDataSets[6]
        ? this.aggregatedDataSets[6].hidden!
        : false;
      this.hour24ChartDataSets![3].hidden! = this.aggregatedDataSets[9]
        ? this.aggregatedDataSets[9].hidden!
        : false;
    }
  }

  async select1YView(time?: Date) {
    this.updateHiddenStatus("1Y");
    if (time instanceof Date)
      this.selectedDate = moment(time).startOf("hour").toDate();

    await this.updateYearChart();

    this.bucketSize = "1Y";
  }

  aggregatedChartLabelFilter(legendItem: ChartLegendLabelItem): any {
    if ([0, 3, 6, 9].includes(legendItem.datasetIndex as number)) return true; //don't show labels for the min max as they are auxiliary lines
  }

  getAggregatedData(
    statisticsAggregation: NetworkStatisticsAggregation[],
    prop: string
  ) {
    return statisticsAggregation.map((stat) => {
      if (stat.crawlCount === 0) return {};
      return {
        x: stat.time,
        //@ts-ignore
        y: stat[prop],
      };
    });
  }

  updateAggregatedDataInDataSets(
    dataSets: ChartDataSets[],
    statisticsAggregation: NetworkStatisticsAggregation[]
  ) {
    dataSets.forEach((dataSet) => {
      switch (dataSet.label) {
        case "Organization":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetOrgs" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Average"
          );
          break;
        case "min(|Organization|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetOrgs" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Min"
          );
          break;
        case "max(|Organization|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetOrgs" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Max"
          );
          break;
        case "Node":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "Set" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Average"
          );
          break;
        case "min(|Node|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "Set" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Min"
          );
          break;
        case "max(|Node|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "Set" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Max"
          );
          break;
        case "Country":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetCountry" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Average"
          );
          break;
        case "min(|Country|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetCountry" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Min"
          );
          break;
        case "max(|Country|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetCountry" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Max"
          );
          break;
        case "ISP":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetISP" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Average"
          );
          break;
        case "min(|ISP|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetISP" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Min"
          );
          break;
        case "max(|ISP|)":
          dataSet.data = this.getAggregatedData(
            statisticsAggregation,
            "min" +
              this.capitalizeFirstLetter(this.setType) +
              "SetISP" +
              (this.canBeFiltered ? "Filtered" : "") +
              "Max"
          );
          break;
      }
    });
  }

  getAggregatedDataSets() {
    let stats: ChartDataSets[] = [
      {
        label: "Organization",
        borderColor: "rgba(25, 151, 198,1)", // primary blue
        backgroundColor: "rgba(25, 151, 198,0.6)", // primary blue
        borderWidth: 2,
        steppedLine: true,
        fill: false,
        type: "line",
        radius: 2,
      },
      {
        label: "min(|Organization|)",
        borderWidth: 4,
        borderColor: "transparent", // primary blue
        backgroundColor: "rgba(25,151,198,0.1)",
        steppedLine: true,
        fill: "0", //relative to dataset with index zero
        type: "line",
        radius: 0,
        hitRadius: 0,
        hoverRadius: 0,
      },
      {
        label: "max(|Organization|)",
        borderWidth: 4,
        borderColor: "transparent", // primary blue
        backgroundColor: "rgba(25,151,198,0.1)",
        steppedLine: true,
        fill: "0",
        type: "line",
        radius: 0,
        hitRadius: 0,
        hoverRadius: 0,
      },
      {
        label: "Node",
        fill: false,
        borderWidth: 2,
        steppedLine: true,
        type: "line",
        radius: 2,
        borderColor: "rgba(27, 201, 142, 1)", // success green
        backgroundColor: "rgba(27, 201, 142, 1)", // success green
      },
      {
        label: "min(|Node|)",
        fill: "3",
        borderWidth: 4,
        steppedLine: true,
        type: "line",
        radius: 0,
        hitRadius: 0,
        hoverRadius: 0,
        borderColor: "transparent", // success green
        backgroundColor: "rgba(27, 201, 142, 0.1)", // success green
      },
      {
        label: "max(|Node|)",
        fill: "3",
        borderWidth: 4,
        steppedLine: true,
        type: "line",
        radius: 0,
        hitRadius: 0,
        hoverRadius: 0,
        borderColor: "transparent", // success green
        backgroundColor: "rgba(27, 201, 142, 0.1)", // success green
      },
    ];
    stats.push(
      ...[
        {
          hidden: true,
          label: "ISP",
          fill: false,
          borderWidth: 2,
          steppedLine: true,
          type: "line",
          radius: 2,
          borderColor: "rgb(236, 228, 114)", // success green
          backgroundColor: "rgb(236, 228, 114)", // success green
        },
        {
          label: "min(|ISP|)",
          fill: "6",
          borderWidth: 4,
          steppedLine: true,
          type: "line",
          radius: 0,
          hitRadius: 0,
          hoverRadius: 0,
          borderColor: "transparent", // success green
          backgroundColor: "rgba(236, 228, 114, 0.1)", // success green
        },
        {
          label: "max(|ISP|)",
          fill: "6",
          borderWidth: 4,
          steppedLine: true,
          type: "line",
          radius: 0,
          hitRadius: 0,
          hoverRadius: 0,
          borderColor: "transparent", // success green
          backgroundColor: "rgba(236, 228, 114, 0.1)", // success green
        },
        {
          hidden: true,
          label: "Country",
          fill: false,
          borderWidth: 2,
          steppedLine: true,
          type: "line",
          radius: 2,
          borderColor: "rgb(159, 134, 255)",
          backgroundColor: "rgb(159, 134, 255)",
        },
        {
          label: "min(|Country|)",
          fill: "9",
          borderWidth: 4,
          steppedLine: true,
          type: "line",
          radius: 0,
          hitRadius: 0,
          hoverRadius: 0,
          borderColor: "transparent", // success green
          backgroundColor: "rgba(159, 134, 255, 0.1)", // success green
        },
        {
          label: "max(|Country|)",
          fill: "9",
          borderWidth: 4,
          steppedLine: true,
          type: "line",
          radius: 0,
          hitRadius: 0,
          hoverRadius: 0,
          borderColor: "transparent", // success green
          backgroundColor: "rgba(159, 134, 255, 0.1)", // success green
        },
      ]
    );

    return stats;
  }

  updateDataInDataSets(dataSets: ChartDataSets[]) {
    dataSets.forEach((dataSet) => {
      switch (dataSet.label) {
        case "Organization":
          dataSet.data = this.hour24Statistics.map((stat) => {
            return {
              x: stat.time,
              //@ts-ignore
              y: stat[
                "min" +
                  this.capitalizeFirstLetter(this.setType) +
                  "SetOrgs" +
                  (this.canBeFiltered ? "Filtered" : "") +
                  "Size"
              ],
            };
          });
          break;
        case "Node":
          dataSet.data = this.hour24Statistics.map((stat) => {
            return {
              x: stat.time,
              //@ts-ignore
              y: stat[
                "min" +
                  this.capitalizeFirstLetter(this.setType) +
                  "Set" +
                  (this.canBeFiltered ? "Filtered" : "") +
                  "Size"
              ],
            };
          });
          break;
        case "ISP":
          dataSet.data = this.hour24Statistics.map((stat) => {
            return {
              x: stat.time,
              //@ts-ignore
              y: stat[
                "min" +
                  this.capitalizeFirstLetter(this.setType) +
                  "SetISP" +
                  (this.canBeFiltered ? "Filtered" : "") +
                  "Size"
              ],
            };
          });
          break;
        case "Country":
          dataSet.data = this.hour24Statistics.map((stat) => {
            return {
              x: stat.time,
              //@ts-ignore
              y: stat[
                "min" +
                  this.capitalizeFirstLetter(this.setType) +
                  "SetCountry" +
                  (this.canBeFiltered ? "Filtered" : "") +
                  "Size"
              ],
            };
          });
          break;
      }
    });
  }

  getHour24ChartDataSets(): ChartDataSets[] {
    let sets = [
      {
        label: "Organization",
        borderColor: "rgba(25, 151, 198,1)", // primary blue
        backgroundColor: "rgba(25, 151, 198,0.6)", // primary blue
        borderWidth: 2,
        steppedLine: true,
        fill: false,
        type: "line",
        radius: 0,
        hitRadius: 5,
      },
      {
        label: "Node",
        borderColor: "rgba(27, 201, 142, 1)", // success green
        backgroundColor: "rgba(27, 201, 142, 1)", // success green
        borderWidth: 2,
        steppedLine: true,
        fill: false,
        type: "line",
        radius: 0,
        hitRadius: 5,
      },
    ];
    sets.push(
      ...[
        {
          label: "ISP",
          borderColor: "rgba(236, 228, 114, 1)", // success green
          backgroundColor: "rgba(236, 228, 114, 1)", // success green
          borderWidth: 2,
          steppedLine: true,
          fill: false,
          type: "line",
          radius: 0,
          hitRadius: 5,
        },
        {
          label: "Country",
          borderColor: "rgba(159, 134, 255, 1)", // success green
          backgroundColor: "rgba(159, 134, 255, 1)", // success green
          borderWidth: 2,
          steppedLine: true,
          fill: false,
          type: "line",
          radius: 0,
          hitRadius: 5,
        },
      ]
    );

    return sets;
  }

  getAggregatedLabels(tooltipItem: ChartTooltipItem, data: ChartData) {
    let avg =
      //@ts-ignore
      data.datasets[tooltipItem.datasetIndex]!.data![tooltipItem.index!]!.y;
    let min =
      //@ts-ignore
      data.datasets[tooltipItem.datasetIndex + 1]!.data![tooltipItem.index!]!.y;
    let max =
      //@ts-ignore
      data.datasets[tooltipItem.datasetIndex + 2]!.data![tooltipItem.index!]!.y;

    return `Average: ${avg}; Min: ${min}; Max: ${max}`;
  }

  getLabels(tooltipItem: ChartTooltipItem, data: ChartData) {
    //@ts-ignore
    return data.datasets![tooltipItem.datasetIndex]!.data![tooltipItem.index!]!
      .y;
  }

  async select30DayView(time?: Date) {
    this.updateHiddenStatus("30D");
    if (time instanceof Date) this.selectedDate = time;
    await this.updateDays30Chart();
    this.bucketSize = "30D";
  }

  async select24HView(time?: Date) {
    if (!this.hour24ChartDataSets)
      this.hour24ChartDataSets = this.getHour24ChartDataSets();
    this.updateHiddenStatus("24H");
    if (time instanceof Date) this.selectedDate = time;

    await this.updateHours24Chart();
    this.bucketSize = "24H";
  }

  async updateSelectedDateAndHighlight(newDate: Date) {
    await this.updateSelectedDate(newDate);
    this.animated = true;
  }

  async updateYearChart() {
    this.isLoading = true;
    let oneYearAgo = moment(this.selectedDate).subtract(1, "y").toDate();
    if (oneYearAgo < this.store.measurementsStartDate) {
      oneYearAgo.setTime(this.store.measurementsStartDate.getTime());
      this.selectedDate = moment(this.store.measurementsStartDate)
        .add(1, "y")
        .toDate();
    }

    try {
      this.failed = false;
      this.yearStatistics =
        await this.store.networkMeasurementStore.getMonthStatistics(
          "stellar-public",
          oneYearAgo,
          this.selectedDate
        );
      this.updateAggregatedDataInDataSets(
        this.aggregatedDataSets,
        this.yearStatistics
      );
    } catch (e) {
      console.log(e);
      this.failed = true;
    }
    this.isLoading = false;
    this.$nextTick(() => {
      if (this.$refs["yearChart"])
        (this.$refs["yearChart"] as AggregationLineChart).updateData(); //for some reason watcher doesn't trigger
    });
  }

  async updateDays30Chart() {
    this.isLoading = true;
    let startOfDay = moment(this.selectedDate).startOf("day").toDate();
    let days30Ahead = moment(this.selectedDate)
      .startOf("day")
      .add(30, "d")
      .toDate();
    try {
      this.failed = false;
      this.days30Statistics =
        await this.store.networkMeasurementStore.getDayStatistics(
          "stellar-public",
          startOfDay,
          days30Ahead
        );
      this.updateAggregatedDataInDataSets(
        this.aggregatedDataSets,
        this.days30Statistics
      );
    } catch (e) {
      this.failed = true;
    }
    this.isLoading = false;
    this.$nextTick(() => {
      if (this.$refs["monthChart"])
        (this.$refs["monthChart"] as AggregationLineChart).updateData(); //for some reason watcher doesn't trigger
    });
  }

  async updateHours24Chart() {
    this.isLoading = true;
    let startOfDay = moment(this.selectedDate).utc().startOf("day").toDate();
    let tomorrow = moment(this.selectedDate)
      .utc()
      .startOf("day")
      .add(1, "d")
      .toDate();
    try {
      this.failed = false;
      this.hour24Statistics =
        await this.store.networkMeasurementStore.getStatistics(
          "stellar-public",
          startOfDay,
          tomorrow
        );
      this.updateDataInDataSets(this.hour24ChartDataSets!);
    } catch (e) {
      this.failed = true;
    }
    this.isLoading = false;
    this.$nextTick(() => {
      if (this.$refs["dayChart"])
        (this.$refs["dayChart"] as AggregationLineChart).updateData(); //for some reason watcher doesn't trigger
    });
  }

  public created() {
    this.aggregatedDataSets = this.getAggregatedDataSets();
    this.bucketSize = this.defaultBucketSize;
  }

  public async mounted() {
    this.statisticsDateTimeNavigator = new StatisticsDateTimeNavigator(
      this.store.measurementsStartDate
    );
    if (this.defaultBucketSize === "30D")
      await this.updateSelectedDate(
        moment(this.network.crawlDate).subtract(29, "d").toDate()
      );
    else await this.updateSelectedDate(this.network.crawlDate);

    this.initialDataLoaded = true;
  }

  protected capitalizeFirstLetter(myString: string) {
    return myString.charAt(0).toUpperCase() + myString.slice(1);
  }
}
</script>

<style scoped>
.canvas-container {
  height: 400px;
  width: 100%;
}
</style>
