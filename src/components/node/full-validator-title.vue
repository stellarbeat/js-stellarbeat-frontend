<template>
  <div>
    <span
      v-if="node.isFullValidator"
      class="badge sb-badge badge-success vertical"
      v-b-tooltip:hover.top="'Full Validator'"
    >
      <b-icon-shield />
    </span>
    {{ truncate(node.displayName, 26) }}
  </div>
</template>

<script setup lang="ts">
import { BIconShield, VBTooltip } from "bootstrap-vue";
import { useTruncate } from "@/composables/useTruncate";

const truncate = useTruncate();
import Vue from "vue";
import { Node } from "@stellarbeat/js-stellarbeat-shared";
Vue.directive("b-tooltip", VBTooltip);

defineProps<{
  node: Node;
}>();
</script>

<style scoped>
.vertical {
  vertical-align: text-bottom;
}
</style>
