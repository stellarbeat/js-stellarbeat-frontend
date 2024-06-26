<template>
  <div class="d-flex">
    <div class="btn-group" role="group">
      <button
        size="sm"
        :disabled="!canGoBack()"
        class="btn btn-sm btn-secondary left"
        @click="goBack"
      >
        <b-icon-chevron-left />
      </button>
      <div>
        <b-form-datepicker
          v-if="!showTime"
          v-model="datePickerDate"
          size="sm"
          :dark="true"
          class="date-picker p-0"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: '2-digit',
          }"
          :min="statisticsDateTimeNavigator.getMinSelectedDate(bucketSize)"
          :max="new Date()"
        >
          <template #button-content
            ><b-icon-calendar class="text-gray"
          /></template>
        </b-form-datepicker>
        <b-form-timepicker
          v-else
          :key="timeKey"
          v-model="time"
          size="sm"
          class="time-picker p-0"
          @hidden="timeInputHandler"
        >
          <template #button-content></template>
        </b-form-timepicker>
      </div>
      <button
        v-tooltip="'Travel to selected time'"
        class="btn btn-sm btn-secondary time-travel-btn"
        @click="timeTravel"
      >
        <b-icon-clock />
      </button>
      <button class="btn btn-sm btn-secondary right" @click="goForward">
        <b-icon-chevron-right />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, type Ref, ref, toRefs, watch } from "vue";
import {
  BFormDatepicker,
  BFormTimepicker,
  BIconCalendar,
  BIconChevronLeft,
  BIconChevronRight,
  BIconClock,
} from "bootstrap-vue";
import StatisticsDateTimeNavigator from "@/components/network/cards/network-risk-analysis-charts/StatisticsDateTimeNavigator";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

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
  store.measurementsStartDate,
);

const datePickerDate: Ref<Date | string> = ref(selectedDate.value);

// Extract the hours and minutes from the selectedDate value
const hours = selectedDate.value.getHours().toString().padStart(2, "0");
const minutes = selectedDate.value.getMinutes().toString().padStart(2, "0");

// Combine the hours and minutes into a time string
const timeString = `${hours}:${minutes}`;

// Create a ref with the time string
const time = ref(timeString);
const timeKey = ref(time.value);

function canGoBack() {
  return statisticsDateTimeNavigator.canGoBack(
    bucketSize.value,
    new Date(datePickerDate.value),
  );
}

function goBack() {
  nextTick(() => {
    datePickerDate.value = statisticsDateTimeNavigator.goBack(
      bucketSize.value,
      new Date(datePickerDate.value),
    );
    time.value = datePickerDate.value.toISOString().substring(11, 16);
    timeKey.value = time.value;
    emit("dateChanged", datePickerDate.value);
  });
}

function goForward() {
  nextTick(() => {
    datePickerDate.value = statisticsDateTimeNavigator.goForward(
      bucketSize.value,
      new Date(datePickerDate.value),
    );
    time.value = datePickerDate.value.toISOString().substring(11, 16);
    timeKey.value = time.value;
    emit("dateChanged", datePickerDate.value);
  });
}

watch(selectedDate, async () => {
  datePickerDate.value = selectedDate.value;
  const selectedHours = selectedDate.value
    .getHours()
    .toString()
    .padStart(2, "0");
  const selectedMinutes = selectedDate.value
    .getMinutes()
    .toString()
    .padStart(2, "0");
  time.value = `${selectedHours}:${selectedMinutes}`;
  timeKey.value = time.value;
});

watch(datePickerDate, async () => {
  if (datePickerDate.value && selectedDate.value !== datePickerDate.value) {
    const selectedHours = new Date(datePickerDate.value)
      .getHours()
      .toString()
      .padStart(2, "0");
    const selectedMinutes = new Date(datePickerDate.value)
      .getMinutes()
      .toString()
      .padStart(2, "0");
    time.value = `${selectedHours}:${selectedMinutes}`;
    timeKey.value = time.value;
    emit("dateChanged", new Date(datePickerDate.value));
  }
});

function timeInputHandler() {
  const selectedHours = Number(time.value.substring(0, 2));
  const selectedMinutes = Number(time.value.substring(3, 5));
  if (
    new Date(datePickerDate.value).getHours() !== selectedHours ||
    new Date(datePickerDate.value).getMinutes() !== selectedMinutes
  ) {
    new Date(datePickerDate.value).setHours(selectedHours, selectedMinutes);
    const date = new Date(datePickerDate.value);
    time.value = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    timeKey.value = time.value;
    emit("dateChanged", datePickerDate.value);
  }
}

const route = useRoute();
const router = useRouter();

function timeTravel() {
  const query = store.copyAndModifyObject(route.query, [
    { key: "at", value: new Date(datePickerDate.value).toISOString() },
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
