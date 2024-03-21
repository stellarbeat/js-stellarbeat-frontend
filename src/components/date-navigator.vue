<template>
  <div class="d-flex">
    <b-button-group size="sm">
      <b-button
        size="sm"
        :disabled="!canGoBack()"
        class="left"
        v-on:click="goBack"
      >
        <b-icon-chevron-left />
      </b-button>
      <div>
        <b-form-datepicker
          size="sm"
          v-if="!showTime"
          :dark="true"
          v-model="datePickerDate"
          class="date-picker p-0"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          }"
          :min="statisticsDateTimeNavigator.getMinSelectedDate(this.bucketSize)"
          :max="new Date()"
        >
          <template v-slot:button-content
            ><b-icon-calendar class="text-gray"
          /></template>
        </b-form-datepicker>
        <b-form-timepicker
          size="sm"
          v-else
          v-model="time"
          class="time-picker p-0"
          @hidden="timeInputHandler"
          :key="timeKey"
        >
          <template v-slot:button-content></template>
        </b-form-timepicker>
      </div>
      <b-button
        size="sm"
        @click="timeTravel"
        variant="secondary"
        class="time-travel-btn"
        v-b-tooltip.hover
        title="Travel to selected time"
      >
        <b-icon-clock />
      </b-button>
      <b-button size="sm" v-on:click="goForward" class="right">
        <b-icon-chevron-right />
      </b-button>
    </b-button-group>
  </div>
</template>

<script setup lang="ts">
import Vue, { nextTick, ref, toRefs, watch } from "vue";
import moment from "moment";
import {
  BButton,
  BIconChevronRight,
  BIconChevronLeft,
  BIconClock,
  BFormDatepicker,
  BFormTimepicker,
  VBTooltip,
  BIconCalendar,
  BButtonGroup,
} from "bootstrap-vue";
import StatisticsDateTimeNavigator from "@/components/network/cards/network-risk-analysis-charts/StatisticsDateTimeNavigator";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

Vue.directive("b-tooltip", VBTooltip);
const props = defineProps({
  selectedDate: {
    type: Date,
    required: true,
  },
  bucketSize: {
    type: String,
    required: true,
  },
  showTime: {
    type: Boolean,
    default: false,
  },
});

const { selectedDate, bucketSize, showTime } = toRefs(props);

const store = useStore();
const emit = defineEmits(["dateChanged"]);

const statisticsDateTimeNavigator = new StatisticsDateTimeNavigator(
  store.measurementsStartDate
);

const datePickerDate = ref(selectedDate.value);
const time = ref(moment(selectedDate.value).format("HH:mm"));
const timeKey = ref(time.value);

function canGoBack() {
  return statisticsDateTimeNavigator.canGoBack(
    bucketSize.value,
    datePickerDate.value
  );
}

function goBack() {
  nextTick(() => {
    datePickerDate.value = statisticsDateTimeNavigator.goBack(
      bucketSize?.value,
      datePickerDate.value
    );
    time.value = moment(datePickerDate.value).format("HH:mm");
    timeKey.value = time.value;
    emit("dateChanged", datePickerDate.value);
  });
}

function goForward() {
  nextTick(() => {
    datePickerDate.value = statisticsDateTimeNavigator.goForward(
      bucketSize?.value,
      datePickerDate.value
    );
    time.value = moment(datePickerDate.value).format("HH:mm");
    timeKey.value = time.value;
    emit("dateChanged", datePickerDate.value);
  });
}

watch(selectedDate, async () => {
  datePickerDate.value = selectedDate.value;
  time.value = moment(selectedDate.value).format("HH:mm");
  timeKey.value = time.value;
});

watch(datePickerDate, async () => {
  if (datePickerDate.value && selectedDate.value !== datePickerDate.value) {
    time.value = moment(datePickerDate.value).format("HH:mm");
    timeKey.value = time.value;
    emit("dateChanged", new Date(datePickerDate.value));
  }
});

function timeInputHandler() {
  if (
    time.value !==
    moment(datePickerDate.value).startOf("minutes").format("HH:mm:ss")
  ) {
    datePickerDate.value = moment(datePickerDate.value)
      .hours(Number(time.value.substring(0, 2)))
      .minutes(Number(time.value.substring(3, 2)))
      .toDate();
    time.value = moment(datePickerDate.value).format("HH:mm");
    timeKey.value = time.value;
    emit("dateChanged", datePickerDate.value);
  }
}

const route = useRoute();
const router = useRouter();

function timeTravel() {
  let query = store.copyAndModifyObject(route.query, [
    { key: "at", value: datePickerDate.value.toISOString() },
  ]);
  router.push({
    name: route.name ? route.name : undefined,
    params: route.params,
    query: query as Record<string, string | Array<string>>,
  });
}
</script>

<style scoped>
.time-travel-btn {
  color: #1997c6;
  border-radius: 0;
}

.time-picker {
  border-radius: 0;
  border-left: 0;
  width: 100px;
  animation: highlight 1s;
}

.date-picker {
  border-radius: 0;
  border-left: 0;
}
</style>
