<template>
  <div
    class="sb-nav-title"
    :class="(hasDanger && completeDanger ? 'sb-danger ' : '') + classes"
  >
    {{ title }}
    <b-icon-exclamation-triangle
      v-if="hasDanger"
      v-b-tooltip.topleft:hover="danger"
      :title="danger"
      class="sb-danger mr-1"
    />
    <b-icon-exclamation-triangle
      v-else-if="hasWarnings"
      v-b-tooltip.topleft:hover="warnings"
      :title="warnings"
      class="sb-alert mr-1"
    />
  </div>
</template>
<script setup lang="ts">
import { BIconExclamationTriangle } from "bootstrap-vue";

defineProps({
  title: { type: String, default: "" },
  hasWarnings: { type: Boolean, default: false },
  warnings: { type: String, default: "" },
  hasDanger: { type: Boolean, default: false },
  danger: { type: String, default: "" },
  completeDanger: { type: Boolean, default: true },
  classes: { type: String, default: "" },
});
</script>

<style scoped>
.sb-nav-title {
  padding-top: 2px;
}

.sb-danger {
  color: #cd201f;
}

.sb-alert {
  color: #fec601;
}

.secondary {
  font-size: 14px;
}

.m-height {
  min-height: 26px;
}
</style>
