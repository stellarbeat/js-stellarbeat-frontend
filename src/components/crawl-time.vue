<template>
  <div class="crawl-time-component">
    <client-only class="crawl-time-component">
      <!--Needs to be client only because date rendering is based on locale!-->
      <b-form-datepicker
        size="sm"
        v-model="time"
        class="date-picker p-0"
        :date-format-options="{
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }"
        :min="minSelectedDate"
        :max="new Date()"
      >
        <template v-slot:button-content>
          <b-icon-calendar class="text-gray" />
        </template>
      </b-form-datepicker>
      <b-form-timepicker
        size="sm"
        v-model="crawlTime"
        class="time-picker p-0"
        dropleft
      >
        <template v-slot:button-content></template>
      </b-form-timepicker>
      <button
        v-b-tooltip.hover
        title="Travel to selected time"
        class="btn btn-sm btn-primary time-travel-btn"
        @click="timeTravel"
      >
        <b-icon-clock />
      </button>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import Vue, { ref, Ref } from "vue";
import moment from "moment";
import ClientOnly from "vue-client-only";
import {
  BIconClock,
  BIconCalendar,
  BFormTimepicker,
  BFormDatepicker,
  VBTooltip,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

Vue.directive("b-tooltip", VBTooltip);

const store = useStore();
const router = useRouter();
const route = useRoute();

const time: Ref<Date> = ref(new Date(store.network.time.getTime()));
const crawlTime: Ref<string> = ref(moment(time.value).format("HH:mm:ss"));
const minSelectedDate: Date = store.measurementsStartDate;

function timeTravel() {
  router.push({
    name: route.name ? route.name : undefined,
    params: route.params,
    query: {
      view: route.query.view,
      "no-scroll": "1",
      network: route.query.network,
      at: moment(time.value)
        .hours(Number(crawlTime.value.substr(0, 2)))
        .minutes(Number(crawlTime.value.substr(3, 2)))
        .toISOString(),
    },
  });
}
</script>

<style scoped>
.date-picker {
  width: auto;
  border-bottom-right-radius: 0;
  border-top-right-radius: 0;
  border-right: 0;
}

.crawl-time-component {
  display: flex;
}

.time-travel-btn {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.time-picker {
  width: 100px;
  border-radius: 0;
}
</style>
<style></style>
