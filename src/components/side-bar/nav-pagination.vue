<template>
  <div v-if="totalRows > 10" class="sb-nav-pagination">
    <b-pagination
      size="sm"
      :value="value"
      :total-rows="totalRows"
      :per-page="10"
      first-number
      last-number
      align="left"
      @input="$emit('input', $event)"
    />
  </div>
</template>
<script setup lang="ts">
import { BPagination } from "bootstrap-vue";

defineProps({
  value: {
    type: Number,
    required: true,
  },
  totalRows: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.sb-nav-pagination {
  margin-top: 1px;
  margin-left: 20px;
}
</style>
