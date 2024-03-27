<template>
  <div class="card">
    <div class="card-header px-3 d-flex flex-wrap justify-content-between">
      <div class="d-flex flex-wrap">
        <b-button-group size="sm" class="mr-3">
          <b-button :pressed="bucketSize === '1Y'" @click="select1YViewDefault"
            >1Y</b-button
          >
          <b-button
            :pressed="bucketSize === '30D'"
            @click="select30DayViewDefault"
            >30D</b-button
          >
          <b-button
            :pressed="bucketSize === '24H'"
            @click="select24HViewDefault"
            >24H</b-button
          >
        </b-button-group>
        <h1 class="card-title">
          {{ capitalizeFirstLetter(analysisType) }} thresholds
        </h1>
      </div>
      <b-button size="sm" @click="showModal = true">
        <b-icon-info-circle
          v-b-modal="'modal-info-' + setType"
          v-tooltip:top="'Info'"
          class="text-muted"
        />
      </b-button>
      <b-modal v-model="showModal" title="Info" ok-only hide-header>
        <slot name="info"></slot>
        <template #modal-footer>
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
      class="card-body d-flex flex-column justify-content-center align-items-center h-100 px-0 pt-0 pb-3"
    >
      <div class="w-100 h-100" :class="dimmerClass">
        <div class="loader"></div>
        <div
          v-if="initialDataLoaded"
          style="height: 240px"
          class="dimmer-content"
        >
          <aggregation-line-chart
            v-if="bucketSize === '1Y'"
            ref="yearChart"
            :key="'1'"
            :chart-data-sets="aggregatedDataSets"
            :chart-labels="getAggregatedLabels"
            :unit="'month'"
            :tooltip-time-format="'MMM yyyy'"
            :time-display-formats="{ month: 'MMM yyyy' }"
            :step-size="1"
            :chart-label-filter="aggregatedChartLabelFilter"
            @click-date="select30DayView"
          />
          <aggregation-line-chart
            v-if="bucketSize === '30D'"
            ref="monthChart"
            :key="'2'"
            :chart-data-sets="aggregatedDataSets"
            :chart-labels="getAggregatedLabels"
            :unit="'day'"
            :tooltip-time-format="'d-M-yyyy'"
            :time-display-formats="{ day: 'd-M-yyyy' }"
            :step-size="2"
            :chart-label-filter="aggregatedChartLabelFilter"
            @click-date="select24HView"
          />
          <aggregation-line-chart
            v-if="bucketSize === '24H'"
            ref="dayChart"
            :key="'3'"
            :unit="'minute'"
            :tooltip-time-format="'d-M-yyyy HH:mm'"
            :time-display-formats="{ minute: 'HH:mm' }"
            :step-size="4"
            point-radius="0"
            :chart-data-sets="hour24ChartDataSets"
            :chart-labels="getLabels"
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
          :min-selected-date="
            statisticsDateTimeNavigator.getMinSelectedDate(bucketSize)
          "
          :selected-date="selectedDate"
          :bucket-size="bucketSize"
          :show-time="bucketSize === '24H'"
          class="mr-1 mb-0 mt-1"
          @dateChanged="updateSelectedDate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ChartDataset,
  ChartTypeRegistry,
  LegendItem,
  ScatterDataPoint,
  TooltipItem,
} from "chart.js";
import {
  BButton,
  BButtonGroup,
  BIconExclamationTriangle,
  BIconInfoCircle,
  BModal,
  VBModal,
} from "bootstrap-vue";
import DateNavigator from "@/components/date-navigator.vue";
import NetworkStatisticsAggregation from "@stellarbeat/js-stellarbeat-shared/lib/network-statistics-aggregation";
import AggregationLineChart from "@/components/network/cards/network-risk-analysis-charts/aggregation-line-chart.vue";
import StatisticsDateTimeNavigator from "@/components/network/cards/network-risk-analysis-charts/StatisticsDateTimeNavigator";
import NetworkStatistics from "@stellarbeat/js-stellarbeat-shared/lib/network-statistics";
import Vue, { computed, nextTick, onMounted, Ref, ref, toRefs } from "vue";
import { useIsLoading } from "@/composables/useIsLoading";
import useStore from "@/store/useStore";
import useNetworkMeasurementsStore from "@/store/useNetworkMeasurementsStore";

Vue.directive("b-modal", VBModal);

const { dimmerClass, isLoading } = useIsLoading();

const props = defineProps({
  analysisType: {
    type: String,
    required: true,
  },
  defaultBucketSize: {
    type: String,
    required: false,
    default: "1Y",
  },
});

const { analysisType, defaultBucketSize } = toRefs(props);

const store = useStore();
const networkMeasurementStore = useNetworkMeasurementsStore();
const network = store.network;
const yearChart = ref<AggregationLineChart | null>(null);
const monthChart = ref<AggregationLineChart | null>(null);
const dayChart = ref<AggregationLineChart | null>(null);
const selectedDate = ref(new Date());
const yearStatistics: Ref<NetworkStatisticsAggregation[]> = ref([]);
const days30Statistics: Ref<NetworkStatisticsAggregation[]> = ref([]);
const hour24Statistics = ref<NetworkStatistics[]>([]);
const initialDataLoaded = ref(false);
const statisticsDateTimeNavigator = ref<StatisticsDateTimeNavigator>(
  new StatisticsDateTimeNavigator(store.measurementsStartDate),
);
const bucketSize = ref(defaultBucketSize?.value ?? "1Y");
const failed = ref(false);
const animated = ref(false);
const showModal = ref(false);
const aggregatedDataSets = ref<ChartDataset[]>(getAggregatedDataSets());
const hour24ChartDataSets = ref<ChartDataset[]>([]);
const setType = computed(() => {
  return props.analysisType === "safety" ? "splitting" : "blocking";
});

const canBeFiltered = computed(() => {
  return setType.value === "blocking";
});

async function updateSelectedDate(newDate: Date) {
  selectedDate.value = newDate;
  if (bucketSize.value === "1Y") await updateYearChart();
  if (bucketSize.value === "30D") await updateDays30Chart();
  if (bucketSize.value === "24H") await updateHours24Chart();
}

async function updateHiddenStatus(toBucketSize: string) {
  if (!hour24ChartDataSets.value) return;
  if (bucketSize.value === "24H") {
    aggregatedDataSets.value[0].hidden = hour24ChartDataSets.value[0].hidden;
    aggregatedDataSets.value[3].hidden = hour24ChartDataSets.value[1].hidden;
    aggregatedDataSets.value[6].hidden = hour24ChartDataSets.value[2]
      ? hour24ChartDataSets.value[2].hidden
      : false;
    aggregatedDataSets.value[9].hidden = hour24ChartDataSets.value[3]
      ? hour24ChartDataSets.value[3].hidden
      : false;
  }
  if (toBucketSize === "24H") {
    hour24ChartDataSets.value[0].hidden = aggregatedDataSets.value[0].hidden;
    hour24ChartDataSets.value[1].hidden = aggregatedDataSets.value[3].hidden;
    hour24ChartDataSets.value[2].hidden = aggregatedDataSets.value[6].hidden;
    hour24ChartDataSets.value[3].hidden = aggregatedDataSets.value[9].hidden;
  }
}

async function select1YViewDefault() {
  const time = new Date(network.time.getTime());
  time.setFullYear(time.getFullYear() - 1);
  await select1YView(time);
}

async function select1YView(time?: Date) {
  await updateHiddenStatus("1Y");
  if (time instanceof Date) selectedDate.value = time;

  await updateYearChart();

  bucketSize.value = "1Y";
}

function aggregatedChartLabelFilter(legendItem: LegendItem) {
  if ([0, 3, 6, 9].includes(legendItem.datasetIndex as number)) return true; //don't show labels for the min max as they are auxiliary lines
}

function getAggregatedData(
  statisticsAggregation: NetworkStatisticsAggregation[],
  prop: string,
): ScatterDataPoint[] {
  return statisticsAggregation
    .filter((stat) => stat.crawlCount > 0)
    .map((stat) => {
      return {
        x: stat.time.getTime(),
        //@ts-ignore
        y: stat[prop] as number,
      };
    });
}

function updateAggregatedDataInDataSets(
  dataSets: ChartDataset[],
  statisticsAggregation: NetworkStatisticsAggregation[],
) {
  dataSets.forEach((dataSet) => {
    switch (dataSet.label) {
      case "Organization":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetOrgs" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Average",
        );
        break;
      case "min(|Organization|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetOrgs" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Min",
        );
        break;
      case "max(|Organization|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetOrgs" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Max",
        );
        break;
      case "Node":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "Set" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Average",
        );
        break;
      case "min(|Node|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "Set" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Min",
        );
        break;
      case "max(|Node|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "Set" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Max",
        );
        break;
      case "Country":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetCountry" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Average",
        );
        break;
      case "min(|Country|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetCountry" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Min",
        );
        break;
      case "max(|Country|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetCountry" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Max",
        );
        break;
      case "ISP":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetISP" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Average",
        );
        break;
      case "min(|ISP|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetISP" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Min",
        );
        break;
      case "max(|ISP|)":
        dataSet.data = getAggregatedData(
          statisticsAggregation,
          "min" +
            capitalizeFirstLetter(setType.value) +
            "SetISP" +
            (canBeFiltered.value ? "Filtered" : "") +
            "Max",
        );
        break;
    }
  });
}

function getAggregatedDataSets() {
  const lineType: keyof ChartTypeRegistry = "line";
  const stats: ChartDataset[] = [
    {
      label: "Organization",
      borderColor: "rgba(25, 151, 198,1)", // primary blue
      backgroundColor: "rgba(25, 151, 198,0.6)", // primary blue
      borderWidth: 2,
      fill: false,
      type: lineType,
      data: [],
    },
    {
      label: "min(|Organization|)",
      borderWidth: 4,
      borderColor: "transparent", // primary blue
      backgroundColor: "rgba(25,151,198,0.1)",
      fill: "0", //relative to dataset with index zero
      type: lineType,
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: "max(|Organization|)",
      borderWidth: 4,
      borderColor: "transparent", // primary blue
      backgroundColor: "rgba(25,151,198,0.1)",
      fill: "0",
      type: lineType,
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: "Node",
      fill: false,
      borderWidth: 2,
      type: lineType,
      borderColor: "rgba(27, 201, 142, 1)", // success green
      backgroundColor: "rgba(27, 201, 142, 1)", // success green
      data: [],
    },
    {
      label: "min(|Node|)",
      fill: "3",
      borderWidth: 4,
      type: lineType,
      borderColor: "transparent", // success green
      backgroundColor: "rgba(27, 201, 142, 0.1)", // success green
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: "max(|Node|)",
      fill: "3",
      borderWidth: 4,
      type: lineType,
      borderColor: "transparent", // success green
      backgroundColor: "rgba(27, 201, 142, 0.1)", // success green
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },

    {
      hidden: true,
      label: "ISP",
      fill: false,
      borderWidth: 2,
      type: lineType as "line", //?
      borderColor: "rgb(236, 228, 114)", // success green
      backgroundColor: "rgb(236, 228, 114)", // success green
      data: [],
    },
    {
      label: "min(|ISP|)",
      fill: "6",
      borderWidth: 4,
      type: lineType,
      borderColor: "transparent", // success green
      backgroundColor: "rgba(236, 228, 114, 0.1)", // success green
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: "max(|ISP|)",
      fill: "6",
      borderWidth: 4,
      type: lineType,
      borderColor: "transparent", // success green
      backgroundColor: "rgba(236, 228, 114, 0.1)", // success green
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
    {
      hidden: true,
      label: "Country",
      fill: false,
      borderWidth: 2,
      type: lineType,
      borderColor: "rgb(159, 134, 255)",
      backgroundColor: "rgb(159, 134, 255)",
      data: [],
    },
    {
      label: "min(|Country|)",
      fill: "9",
      borderWidth: 4,
      type: lineType,
      borderColor: "transparent", // success green
      backgroundColor: "rgba(159, 134, 255, 0.1)", // success green
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
    {
      label: "max(|Country|)",
      fill: "9",
      borderWidth: 4,
      type: "line",
      borderColor: "transparent", // success green
      backgroundColor: "rgba(159, 134, 255, 0.1)", // success green
      data: [],
      pointRadius: 0,
      pointHitRadius: 0,
      pointHoverRadius: 0,
    },
  ];

  return stats;
}

function updateDataInDataSets(dataSets: ChartDataset[]) {
  dataSets.forEach((dataSet) => {
    switch (dataSet.label) {
      case "Organization":
        dataSet.data = hour24Statistics.value.map((stat) => {
          return {
            x: stat.time.getTime(),
            //@ts-ignore
            y: stat[
              "min" +
                capitalizeFirstLetter(setType.value) +
                "SetOrgs" +
                (canBeFiltered.value ? "Filtered" : "") +
                "Size"
            ],
          };
        });
        break;
      case "Node":
        dataSet.data = hour24Statistics.value.map((stat) => {
          return {
            x: stat.time.getTime(),
            //@ts-ignore
            y: stat[
              "min" +
                capitalizeFirstLetter(setType.value) +
                "Set" +
                (canBeFiltered.value ? "Filtered" : "") +
                "Size"
            ],
          };
        });
        break;
      case "ISP":
        dataSet.data = hour24Statistics.value.map((stat) => {
          return {
            x: stat.time.getTime(),
            //@ts-ignore
            y: stat[
              "min" +
                capitalizeFirstLetter(setType.value) +
                "SetISP" +
                (canBeFiltered.value ? "Filtered" : "") +
                "Size"
            ],
          };
        });
        break;
      case "Country":
        dataSet.data = hour24Statistics.value.map((stat) => {
          return {
            x: stat.time.getTime(),
            //@ts-ignore
            y: stat[
              "min" +
                capitalizeFirstLetter(setType.value) +
                "SetCountry" +
                (canBeFiltered.value ? "Filtered" : "") +
                "Size"
            ],
          };
        });
        break;
    }
  });
}

function getHour24ChartDataSets(): ChartDataset[] {
  const lineType: keyof ChartTypeRegistry = "line";
  const sets: ChartDataset[] = [
    {
      label: "Organization",
      borderColor: "rgba(25, 151, 198,1)", // primary blue
      backgroundColor: "rgba(25, 151, 198,0.6)", // primary blue
      borderWidth: 2,
      fill: false,
      type: lineType,
      data: [],
      pointRadius: 0,
      pointHitRadius: 5,
    },
    {
      label: "Node",
      borderColor: "rgba(27, 201, 142, 1)", // success green
      backgroundColor: "rgba(27, 201, 142, 1)", // success green
      borderWidth: 2,
      fill: false,
      type: lineType,
      data: [],
      pointRadius: 0,
      pointHitRadius: 5,
    },
  ];
  sets.push(
    ...[
      {
        label: "ISP",
        borderColor: "rgba(236, 228, 114, 1)", // success green
        backgroundColor: "rgba(236, 228, 114, 1)", // success green
        borderWidth: 2,
        fill: false,
        type: lineType,
        data: [],
        pointRadius: 0,
        pointHitRadius: 5,
      },
      {
        label: "Country",
        borderColor: "rgba(159, 134, 255, 1)", // success green
        backgroundColor: "rgba(159, 134, 255, 1)", // success green
        borderWidth: 2,
        fill: false,
        type: lineType,
        data: [],
        pointRadius: 0,
        pointHitRadius: 5,
      },
    ],
  );

  return sets;
}

function getAggregatedLabels(tooltipItem: TooltipItem<"line">): string {
  const dataSet = aggregatedDataSets.value[tooltipItem.datasetIndex];
  if (!dataSet.data) return "";
  const avg = (dataSet.data[tooltipItem.dataIndex] as ScatterDataPoint).y;
  const dataSet2 = aggregatedDataSets.value[tooltipItem.datasetIndex + 1];
  if (!dataSet2.data) return "";
  const min = (dataSet2.data[tooltipItem.dataIndex] as ScatterDataPoint).y;
  const dataSet3 = aggregatedDataSets.value[tooltipItem.datasetIndex + 2];
  if (!dataSet3.data) return "";
  const max = (dataSet3.data[tooltipItem.dataIndex] as ScatterDataPoint).y;
  return `Average: ${avg}; Min: ${min}; Max: ${max}`;
}

function getLabels(tooltipItem: TooltipItem<"line">): string {
  if (hour24ChartDataSets.value.length === 0) return "0";
  const dataSet = hour24ChartDataSets.value[tooltipItem.datasetIndex];
  return (dataSet.data[tooltipItem.dataIndex] as ScatterDataPoint).y.toString();
}

async function select30DayViewDefault() {
  const time = new Date(network.time.getTime());
  time.setDate(time.getDate() - 30);
  await select30DayView(time);
}

async function select30DayView(time?: Date) {
  if (time instanceof Date) selectedDate.value = time;
  await updateDays30Chart();
  await updateHiddenStatus("30D");
  bucketSize.value = "30D";
}

async function select24HViewDefault() {
  const time = new Date(network.time.getTime());
  time.setDate(time.getDate() - 1);
  await select24HView(time);
}

async function select24HView(time?: Date) {
  if (hour24ChartDataSets.value.length === 0)
    hour24ChartDataSets.value = getHour24ChartDataSets();
  await updateHiddenStatus("24H");
  if (time instanceof Date) selectedDate.value = time;

  await updateHours24Chart();
  bucketSize.value = "24H";
}

async function updateSelectedDateAndHighlight(newDate: Date) {
  selectedDate.value = newDate;
  animated.value = true;
}

async function updateYearChart() {
  isLoading.value = true;
  const from = selectedDate.value;
  const to = new Date(selectedDate.value.getTime());
  to.setFullYear(to.getFullYear() + 1);

  try {
    failed.value = false;
    yearStatistics.value = await networkMeasurementStore.getMonthStatistics(
      "stellar-public",
      from,
      to,
    );
    updateAggregatedDataInDataSets(
      aggregatedDataSets.value,
      yearStatistics.value,
    );
  } catch (e) {
    failed.value = true;
  }
  isLoading.value = false;
  nextTick(() => {
    if (yearChart.value)
      //@ts-ignore
      yearChart.value.updateData(); //for some reason watcher doesn't trigger
  });
}

async function updateDays30Chart() {
  isLoading.value = true;
  const from = selectedDate.value;
  const to = new Date(selectedDate.value.getTime());
  to.setDate(to.getDate() + 30);
  try {
    failed.value = false;
    days30Statistics.value = await networkMeasurementStore.getDayStatistics(
      network.id ?? "stellar-public",
      from,
      to,
    );
    updateAggregatedDataInDataSets(
      aggregatedDataSets.value,
      days30Statistics.value,
    );
  } catch (e) {
    failed.value = true;
  }
  isLoading.value = false;
  nextTick(() => {
    if (monthChart.value)
      //@ts-ignore
      monthChart.value.updateData(); //for some reason watcher doesn't trigger
  });
}

async function updateHours24Chart() {
  isLoading.value = true;
  const from = selectedDate.value;
  const to = new Date(from.getTime());
  to.setDate(to.getDate() + 1); //add one day

  try {
    failed.value = false;
    hour24Statistics.value = await networkMeasurementStore.getStatistics(
      "stellar-public",
      from,
      to,
    );
    updateDataInDataSets(hour24ChartDataSets.value as ChartDataset[]);
  } catch (e) {
    failed.value = true;
  }
  isLoading.value = false;
  nextTick(() => {
    if (dayChart.value)
      //@ts-ignore
      dayChart.value.updateData(); //for some reason watcher doesn't trigger
  });
}

onMounted(async () => {
  if (defaultBucketSize.value === "30D") await select30DayViewDefault();
  else if (defaultBucketSize?.value === "1Y") await select1YViewDefault();
  else await select24HViewDefault();

  initialDataLoaded.value = true;
});

function capitalizeFirstLetter(myString: string) {
  return myString.charAt(0).toUpperCase() + myString.slice(1);
}
</script>
