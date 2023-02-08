<template>
  <div class="card" style="">
    <div class="card-header pl-3 d-flex flex-wrap">
      <b-button-group size="sm" class="mr-3">
        <b-button :pressed="chartView === '30D'" @click="select30DayView"
          >30D</b-button
        >
        <b-button :pressed="chartView === '24H'" @click="select24HView"
          >24H</b-button
        >
        <b-button :pressed="chartView === '1H'" @click="select1HView"
          >1H</b-button
        >
      </b-button-group>
      <h5 class="card-title">
        {{ subject }}
      </h5>
    </div>
    <div v-if="failed" class="card-alert alert alert-danger mb-0">
      <b-icon-exclamation-triangle />
      Error fetching data
    </div>
    <div class="card-body p-2">
      <div v-bind:class="dimmerClass" class="h-100">
        <div class="loader"></div>
        <div
          class="dimmer-content h-100 d-flex flex-column align-items-center justify-content-center"
          ref="chartContainer"
        >
          <div v-if="rendered">
            <BarChartDay
              v-if="chartView === '30D'"
              v-on:click-date="select24HView"
              :width="chartWidth"
              :data="thirtyDaysBarChartData"
              :unit="'day'"
              :key="'1'"
            />
            <BarChartDay
              v-on:click-date="select1HView"
              v-if="chartView === '24H'"
              :width="chartWidth"
              :data="twentyFourHourBarChartData"
              :unit="'hour'"
              :key="'2'"
            />
            <line-chart-hour
              v-on:click-date="updateSelectedDateAndHighlight"
              v-if="chartView === '1H'"
              v-on:update-view="updateView"
              :width="chartWidth"
              :data="oneHourLineChartData"
              :inverted="inverted"
            />
          </div>

          <div
            class="d-flex flex-wrap mt-1"
            :class="{ animated: animated }"
            @animationend="animated = false"
          >
            <date-navigator
              v-if="rendered"
              :selectedDate="selectedDate"
              v-on:dateChanged="updateSelectedDate"
              :showTime="chartView === '1H'"
              class="mr-1 mb-1"
              :bucket-size="chartView"
            >
            </date-navigator>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import DateNavigator from "@/components/date-navigator.vue";
import LineChartHour from "@/components/charts/line-chart-hour.vue";
import { Statistics, StatisticsAggregation } from "@/store/StatisticsStore";
import { BButton, BButtonGroup } from "bootstrap-vue";
import StatisticsDateTimeNavigator from "@/components/network/cards/network-risk-analysis-charts/StatisticsDateTimeNavigator";
import useStore from "@/store/useStore";
import { useIsLoading } from "@/composables/useIsLoading";
import { computed, onMounted, ref, toRefs, watch } from "vue";
import BarChartDay from "@/components/charts/bar-chart-day.vue";

const { isLoading, dimmerClass } = useIsLoading();

interface Props {
  subject: string;
  fetchDayMeasurements: <T extends StatisticsAggregation>(
    id: string,
    from: Date,
    to: Date
  ) => Promise<T[]>;
  fetchMeasurements: (
    id: string,
    from: Date,
    to: Date
  ) => Promise<Statistics[]>;
  dayMeasurementProperty: string;
  measurementProperty: string;
  entityId: string;
  inverted?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  inverted: false,
});

const {
  subject,
  fetchDayMeasurements,
  fetchMeasurements,
  dayMeasurementProperty,
  measurementProperty,
  entityId,
  inverted,
} = toRefs(props);

const store = useStore();

const thirtyDayMeasurements = ref<StatisticsAggregation[]>([]);
const twentyFourHourMeasurements = ref<Statistics[]>([]);

const statisticsDateTimeNavigator = new StatisticsDateTimeNavigator(
  store.measurementsStartDate
);

const rendered = ref(false);
const selectedDate = ref(new Date());
const failed = ref(false);
const chartView = ref("30D");
const animated = ref(false);

async function select30DayView(time?: Date) {
  if (time instanceof Date) selectedDate.value = time;

  await updateDayHistoryChart();
  chartView.value = "30D";
}

async function select24HView(time?: Date) {
  if (time instanceof Date)
    selectedDate.value = moment(time).startOf("day").toDate();

  await update24HourHistoryChart();
  chartView.value = "24H";
}

async function select1HView(time?: Date) {
  if (time instanceof Date)
    selectedDate.value = moment(time).startOf("hour").toDate();

  await update24HourHistoryChart();

  chartView.value = "1H";
}

function updateView(view: string) {
  chartView.value = view;
}

async function updateSelectedDate(newDate: string) {
  selectedDate.value = new Date(newDate);
  if (chartView.value === "30D") await updateDayHistoryChart();
  else await update24HourHistoryChart();
}

async function updateSelectedDateAndHighlight(newDate: string) {
  await updateSelectedDate(newDate);
  animated.value = true;
}

watch(entityId, async () => {
  if (chartView.value === "30D") await updateDayHistoryChart();
  else await update24HourHistoryChart();
});

const chartContainer = ref<HTMLDivElement | null>(null);
const chartWidth = computed(() => {
  if (!chartContainer.value) return 0;
  return chartContainer.value.clientWidth;
});

async function updateDayHistoryChart() {
  isLoading.value = true;
  let thirtyDaysAgo = moment(selectedDate.value).subtract(29, "d").toDate();
  try {
    failed.value = false;
    thirtyDayMeasurements.value = await fetchDayMeasurements.value(
      entityId.value,
      thirtyDaysAgo,
      moment(selectedDate.value).add(1, "day").startOf("day").toDate()
    );
  } catch (e) {
    failed.value = true;
  }
  isLoading.value = false;
}

async function update24HourHistoryChart() {
  isLoading.value = true;
  let tomorrow = moment(selectedDate.value).startOf("day").add(1, "d").toDate();
  try {
    failed.value = false;
    twentyFourHourMeasurements.value = await fetchMeasurements.value(
      entityId.value,
      moment(selectedDate.value).startOf("day").toDate(),
      tomorrow
    );
  } catch (e) {
    failed.value = true;
  }
  isLoading.value = false;
}

const thirtyDaysBarChartData = computed(() => {
  function getY(measurement: StatisticsAggregation) {
    const value = //@ts-ignore
      measurement[dayMeasurementProperty.value] / measurement.crawlCount;
    return Number((value * 100).toFixed(2));
  }

  return thirtyDayMeasurements.value.map((measurement) => {
    if (!inverted.value) {
      return {
        x: measurement.time as Date,
        y: getY(measurement),
      };
    } else {
      return {
        x: measurement.time as Date,
        y: Number(
          (
            ((measurement.crawlCount -
              //@ts-ignore
              measurement[dayMeasurementProperty.value]) /
              measurement.crawlCount) *
            100
          ).toFixed(2)
        ),
      };
    }
  });
});

const twentyFourHourBarChartData = computed((): { x: Date; y: number }[] => {
  let twentyFourHourMap = new Map<string, number[]>();
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  twentyFourHourMeasurements.value.forEach((measurement: any) => {
    let hourBucketString = moment(measurement.time)
      .startOf("hour")
      .toISOString();
    let twentyFourHourValue = twentyFourHourMap.get(hourBucketString);
    if (twentyFourHourValue === undefined) twentyFourHourValue = [];
    twentyFourHourValue.push(measurement[measurementProperty.value]);
    twentyFourHourMap.set(hourBucketString, twentyFourHourValue);
  });

  let twentyFourHourAverages: { x: Date; y: number }[] = [];
  twentyFourHourMap.forEach((measurements, hourString) => {
    if (inverted.value) {
      twentyFourHourAverages.push({
        x: new Date(hourString),
        y: Number(
          (
            100 -
            (measurements.reduce((a, b) => a + b, 0) / measurements.length) *
              100
          ).toFixed(2)
        ),
      });
    } else {
      twentyFourHourAverages.push({
        x: new Date(hourString),
        y: Number(
          (
            (measurements.reduce((a, b) => a + b, 0) / measurements.length) *
            100
          ).toFixed(2)
        ),
      });
    }
  });

  return twentyFourHourAverages;
});

const oneHourLineChartData = computed((): { x: Date; y: number }[] => {
  return twentyFourHourMeasurements.value
    .filter(
      (measurement) =>
        measurement.time.getHours() ===
        moment(selectedDate.value).add(0, "hour").toDate().getHours()
    )
    .map((measurement: any) => {
      if (!inverted.value) {
        return {
          x: measurement.time as Date,
          y: measurement[measurementProperty.value],
        };
      } else {
        return {
          x: measurement.time as Date,
          y: measurement[measurementProperty.value],
        };
      }
    });
});

onMounted(async () => {
  selectedDate.value = statisticsDateTimeNavigator.getInitialSelectedDate(
    chartView.value,
    store.network.time
  );
  await updateDayHistoryChart();
  rendered.value = true;
});
</script>
<style scoped></style>
