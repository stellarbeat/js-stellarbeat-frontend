<template>
  <div class="sb-nav-pagination" v-if="totalRows > 10">
    <b-pagination
      size="sm"
      v-bind:value="value"
      :total-rows="totalRows"
      :per-page="10"
      first-number
      last-number
      align="left"
      v-on:input="$emit('input', $event)"
    />
  </div>
</template>
<script setup lang="ts">
import { BPagination } from "bootstrap-vue";
import { defineProps } from "vue";

defineProps({
  value: {},
  totalRows: {},
});
</script>

<style scoped>
.sb-nav-pagination {
  margin-top: 1px;
  margin-left: 20px;
}
</style>
