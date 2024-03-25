<template>
  <div>
    <b-form-input
      id="searchInput"
      v-model="filter"
      class="form-control search mr-0"
      type="text"
      placeholder="Type public key, name, ... to search"
    />
    <b-table
      striped
      hover
      responsive
      :items="nodes"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :per-page="perPage"
      :filter="filter"
      selectable
      :select-mode="mode"
      :current-page="currentPage"
      selected-variant="success"
      @filtered="onFiltered"
      @row-selected="rowSelected"
    >
      <template #cell(name)="row">
        <span
          v-if="row.item.isFullValidator"
          v-b-tooltip.hover
          class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
          title="Full validator"
        >
          <b-icon-shield />
        </span>
        {{ truncate(row.item.name, 20) || " " }}
      </template>

      <template #cell(version)="data">
        {{ truncate(data.value, 28) || " " }}
      </template>
    </b-table>

    <b-pagination
      ref="paginator"
      v-model="currentPage"
      :total-rows="totalRows"
      :per-page="perPage"
      class="my-1"
    />
  </div>
</template>

<script setup lang="ts">
import Vue, { computed, onMounted, ref } from "vue";

import { Node } from "@stellarbeat/js-stellarbeat-shared";
import {
  BFormInput,
  BIconShield,
  BPagination,
  BTable,
  VBTooltip,
} from "bootstrap-vue";
import { useTruncate } from "@/composables/useTruncate";

Vue.directive("b-tooltip", VBTooltip);

const props = defineProps<{
  validators: Node[];
}>();

const emit = defineEmits(["validators-selected"]);
const truncate = useTruncate();

const mode = ref("multi");
const sortBy = ref("index");
const sortDesc = ref(true);
const perPage = ref(10);
const currentPage = ref(1);
const filter = ref("");
const totalRows = ref(1);
const fields = ref([
  { key: "name", sortable: true },
  { key: "availability", sortable: true },
  { key: "index", label: "index (experimental)", sortable: true },
  { key: "version", sortable: true },
]);

const nodes = computed(() => {
  return props.validators.map((node) => {
    return {
      name: node.displayName,
      version: node.versionStr,
      isFullValidator: node.isFullValidator,
      index: node.index,
      publicKey: node.publicKey,
    };
  });
});

function rowSelected(items: Node[]) {
  emit("validators-selected", items);
}

const onFiltered = (filteredItems: unknown[]) => {
  totalRows.value = filteredItems.length;
  currentPage.value = 1;
};

onMounted(() => {
  // Set the initial number of items
  totalRows.value = nodes.value.length;
});
</script>
