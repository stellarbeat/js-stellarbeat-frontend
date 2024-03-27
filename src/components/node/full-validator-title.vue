<template>
  <div>
    <span
      v-if="node.isFullValidator"
      v-tooltip:top="'Full Validator'"
      class="badge sb-badge badge-success vertical"
    >
      <b-icon-shield />
    </span>
    {{ truncate(node.displayName, 26) }}
  </div>
</template>

<script setup lang="ts">
import { BIconShield } from "bootstrap-vue";
import { useTruncate } from "@/composables/useTruncate";
import { Node } from "@stellarbeat/js-stellarbeat-shared";

const truncate = useTruncate();

defineProps<{
  node: Node;
}>();
</script>

<style scoped>
.vertical {
  vertical-align: text-bottom;
}
</style>
