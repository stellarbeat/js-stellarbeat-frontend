<template>
  <div>
    <b-form-input
      class="form-control search mr-0"
      type="text"
      v-model="filter"
      id="searchInput"
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
      @filtered="onFiltered"
      selectable
      @row-selected="rowSelected"
      :select-mode="mode"
      :current-page="currentPage"
      selectedVariant="success"
    >
      <template v-slot:cell(name)="row">
        <span
          v-if="row.item.isFullValidator"
          class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
          v-b-tooltip.hover
          title="Full validator"
        >
          <b-icon-shield />
        </span>
        {{ truncate(row.item.name, 20) || " " }}
      </template>

      <template v-slot:cell(version)="data">
        {{ truncate(data.value, 28) || " " }}
      </template>
    </b-table>

    <b-pagination
      :totalRows="totalRows"
      :per-page="perPage"
      v-model="currentPage"
      ref="paginator"
      class="my-1"
    />
  </div>
</template>

<script setup lang="ts">
import Vue, { computed, onMounted, ref } from "vue";

import { Node } from "@stellarbeat/js-stellar-domain";
import {
  BFormInput,
  BIconShield,
  BPagination,
  BTable,
  VBTooltip,
} from "bootstrap-vue";
import { useTruncate } from "@/mixins/useTruncate";

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
