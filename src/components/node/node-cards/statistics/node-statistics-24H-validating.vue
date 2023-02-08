<template>
  <div class="card">
    <div class="card-body d-flex flex-row flex-wrap align-items-center p-3">
      <gauge
        width="45px"
        height="45px"
        :value="node.statistics.validating24HoursPercentage"
        :max-value="100"
        value-color="#5eba00"
        negative-value-color="#cd201f"
        class="mr-3"
      />
      <div class="lh-sm">
        <div class="strong">
          {{ +node.statistics.validating24HoursPercentage.toFixed(2) }}%
        </div>
        <div class="text-muted">24H Validating</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Node } from "@stellarbeat/js-stellar-domain";
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
