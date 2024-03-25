<template>
  <div class="crawl-time-component">
    <b-form-datepicker
      v-model="time"
      size="sm"
      class="date-picker p-0"
      :date-format-options="{
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }"
      :min="minSelectedDate"
      :max="new Date()"
      no-highlight-today
    >
      <template #button-content>
        <b-icon-calendar class="text-gray" />
      </template>
    </b-form-datepicker>
    <b-form-timepicker
      v-model="crawlTime"
      size="sm"
      class="time-picker p-0"
      dropleft
    >
      <template #button-content></template>
    </b-form-timepicker>
    <b-button
      v-b-tooltip.hover
      size="sm"
      variant="secondary"
      class="time-travel-btn"
      title="Travel to selected time"
      @click="timeTravel"
    >
      <b-icon-clock />
    </b-button>
  </div>
</template>

<script setup lang="ts">
import Vue, { ref, Ref } from "vue";
import {
  BIconClock,
  BIconCalendar,
  BFormTimepicker,
  BFormDatepicker,
  VBTooltip,
  BButton,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

Vue.directive("b-tooltip", VBTooltip);

const store = useStore();
const router = useRouter();
const route = useRoute();

const time: Ref<Date | number | string> = ref(
  new Date(store.network.time.getTime()),
);
const crawlTime: Ref<string> = ref(formatCrawlTime());
const minSelectedDate: Date = store.measurementsStartDate;

function formatCrawlTime() {
  const date = timeToDateObject();
  return (
    date.getHours().toString().padStart(2, "0") +
    ":" +
    date.getMinutes().toString().padStart(2, "0") +
    ":" +
    date.getSeconds().toString().padStart(2, "0")
  );
}
function timeTravel() {
  router.push({
    name: route.name ? route.name : undefined,
    params: route.params,
    query: {
      view: route.query.view,
      "no-scroll": "1",
      network: route.query.network,
      at: getTimeTravelAt(),
    },
  });
}

function getTimeTravelAt() {
  const date = timeToDateObject();
  // Set the hours of the date object to the hours part of the crawlTime value
  date.setHours(Number(crawlTime.value.substring(0, 2)));
  // Set the minutes of the date object to the minutes part of the crawlTime value
  date.setMinutes(Number(crawlTime.value.substring(3, 5)));
  return date.toISOString();
}

function timeToDateObject() {
  let date = time.value;
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === "number") {
    // If networkTime is a timestamp
    date = new Date(date);
  } else if (typeof date === "string") {
    // If networkTime is a string
    date = new Date(Date.parse(date));
  } else {
    console.error("Invalid time travel time:", date);
    date = new Date();
  }

  return date;
}
</script>

<style lang="scss" scoped>
.date-picker {
  width: auto;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  border-right: 0;
  color: green !important;
}

.crawl-time-component {
  display: flex;
}

.time-travel-btn {
  color: #1997c6;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.time-picker {
  width: 120px;
  border-radius: 0;
  border-right: none;
}
</style>

<style>
.crawl-time-component {
  color: #868e96ff;
}
</style>
