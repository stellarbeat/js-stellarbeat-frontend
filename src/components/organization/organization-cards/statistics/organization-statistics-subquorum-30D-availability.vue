<template>
  <div class="card">
    <div class="card-body d-flex flex-row flex-wrap align-items-center p-3">
      <gauge
        width="65px"
        height="65px"
        :value="organization.subQuorum30DaysAvailability"
        :max-value="100"
        value-color="#5eba00"
        negative-value-color="#cd201f"
        class="mr-3"
      />
      <div class="lh-sm">
        <div class="strong">
          {{ +organization.subQuorum30DaysAvailability.toFixed(2) }}%
        </div>
        <div class="text-muted">
          30D Availability
          <b-icon-info-circle
            v-b-tooltip:hover="
              'Availability: more than or equal to 50% of the organization validators are validating.'
            "
            class="text-gray"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Vue from "vue";
import { Organization } from "@stellarbeat/js-stellarbeat-shared";
import Gauge from "@/components/charts/gauge.vue";
import { VBTooltip, BIconInfoCircle } from "bootstrap-vue";

Vue.directive("b-tooltip", VBTooltip);

defineProps<{
  organization: Organization;
}>();
</script>

<style scoped>
.strong {
  font-weight: 500;
}
.text-muted {
  color: #6e7582 !important;
}
</style>
