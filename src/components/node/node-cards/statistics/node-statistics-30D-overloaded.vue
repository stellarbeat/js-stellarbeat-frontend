<template>
  <div class="card">
    <div class="card-body d-flex flex-row flex-wrap align-items-center p-3">
      <gauge
        width="45px"
        height="45px"
        :value="node.statistics.overLoaded30DaysPercentage"
        :max-value="100"
        value-color="#cd201f"
        negative-value-color="#5eba00"
        class="mr-3"
      />
      <div class="lh-sm">
        <div v-if="node.statistics.has30DayStats" class="strong">
          {{ +node.statistics.overLoaded30DaysPercentage.toFixed(2) }}%
        </div>
        <div v-else class="strong">N/A</div>
        <div class="text-muted">30D Overload</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import Gauge from "@/components/charts/gauge.vue";

defineProps<{
  node: Node;
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
