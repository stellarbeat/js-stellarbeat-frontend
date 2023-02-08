<template>
  <div class="card" :class="dimmerClass">
    <div class="loader"></div>
    <div
      class="card-body p-0 d-flex flex-column justify-content-between dimmer-content"
    >
      <div class="d-flex justify-content-between align-items-start pt-3 px-3">
        <div class="">
          <div class="text-muted">
            {{ title }}
          </div>
          <div>
            <div v-if="hasActiveElement" class="d-flex">
              <div class="active-element-value mr-1">
                {{
                  isBool
                    ? activeElement[statsProperty] * 100 + "%"
                    : activeElement[statsProperty]
                }}
              </div>
              <div class="active-element-time align-self-start text-muted">
                {{ formatTime(activeElement.time) }}
              </div>
            </div>
            <div v-else>
              <div v-if="value !== undefined">
                <div
                  v-if="isBool || unknown"
                  class="value"
                  style="color: #5eba00"
                >
                  <b-badge
                    v-if="!unknown"
                    :variant="value ? 'success' : 'danger'"
                    >{{ value ? "Yes" : "No" }}</b-badge
                  >
                  <b-badge v-else variant="default">Not analyzed</b-badge>
                </div>
                <div v-else class="value">
                  {{ value }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <b-button
          size="sm"
          @click="showModal = true"
          style="border: none; box-shadow: none"
        >
          <b-icon-info-circle
            v-b-tooltip:hover.top="'Click for info'"
            class="text-muted"
          />
        </b-button>
      </div>
      <div
        style="height: 35px"
        v-show="!store.isSimulation && store.networkContext.enableHistory"
      >
        <network-statistics-chart
          v-if="initialDataLoaded"
          :stats-property="statsProperty"
          :year-statistics="yearStatistics"
          v-on:hover="onHover"
        />
      </div>
      <div
        v-show="store.isSimulation || !store.networkContext.enableHistory"
        class="mb-4"
      ></div>
    </div>
    <b-modal lazy title="Info" ok-only hide-header v-model="showModal">
      <slot name="info"></slot>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import moment from "moment";
import {
  BIconInfoCircle,
  VBTooltip,
  BButton,
  BModal,
  BBadge,
} from "bootstrap-vue";
import NetworkStatisticsChart from "@/components/network/cards/network-statistics/network-statistics-chart.vue";
import NetworkStatisticsAggregation from "@stellarbeat/js-stellar-domain/lib/network-statistics-aggregation";
import Vue, { computed, Ref, ref, toRefs, withDefaults } from "vue";
import useStore from "@/store/useStore";

Vue.directive("b-tooltip", VBTooltip);

const store = useStore();
export interface Props {
  isLoading: boolean;
  tooltip: string;
  title: string;
  value: number | boolean;
  initialDataLoaded: boolean;
  yearStatistics: NetworkStatisticsAggregation[];
  statsProperty: string;
  isBool?: boolean;
  isSimulationSensitive?: boolean;
  unknown?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  isLoading: true,
  isBool: false,
  isSimulationSensitive: false,
  unknown: false,
});

const {
  title,
  value,
  initialDataLoaded,
  yearStatistics,
  statsProperty,
  isBool,
  unknown,
} = toRefs(props);

const activeElement: Ref<NetworkStatisticsAggregation | null> = ref(null);
const showModal = ref(false);

const hasActiveElement = computed(() => activeElement.value !== null);

function onHover(stat: NetworkStatisticsAggregation) {
  activeElement.value = stat;
}

function formatTime(date: Date) {
  return moment(date).format("MMM YYYY");
}

const dimmerClass = computed(() => {
  return {
    dimmer: true,
    active: props.isLoading,
  };
});
</script>

<style scoped>
.value {
  font-size: 18px;
  font-weight: bold;
  line-height: 20px;
  padding-bottom: 0;
}

.active-element-time {
  font-size: 12px;
  line-height: 17px;
  align-self: flex-start;
}

.active-element-value {
  font-size: 18px;
  font-weight: bold;
  line-height: 20px;
  padding-bottom: 0;
}
</style>
