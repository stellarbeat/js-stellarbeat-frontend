<template>
  <div>
    <b-form-input
      class="form-control search mr-0"
      type="text"
      v-model="filter"
      id="searchInput"
      placeholder="Type name, ... to search"
    />
    <b-table
      striped
      hover
      responsive
      :items="organizations"
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
          v-if="row.item.isTierOneOrganization"
          class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
          v-b-tooltip.hover
          title="Tier 1 organization"
        >
          <b-icon-shield />
        </span>
        {{ row.item.name }}
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
import Vue, { onMounted, ref } from "vue";

import { Node, Organization } from "@stellarbeat/js-stellarbeat-shared";
import {
  BFormInput,
  BIconShield,
  BPagination,
  BTable,
  VBTooltip,
} from "bootstrap-vue";

Vue.directive("b-tooltip", VBTooltip);

const props = defineProps<{
  organizations: Organization[];
}>();

const emit = defineEmits(["organizations-selected"]);

const mode = ref("multi");
const sortBy = ref("index");
const sortDesc = ref(true);
const perPage = ref(10);
const currentPage = ref(1);
const filter = ref("");
const totalRows = ref(1);
const fields = ref([
  { key: "name", sortable: true },
  { key: "availability", sortable: true, label: "30D availability" },
]);

function rowSelected(items: Node[]) {
  emit("organizations-selected", items);
}

const onFiltered = (filteredItems: unknown[]) => {
  totalRows.value = filteredItems.length;
  currentPage.value = 1;
};

onMounted(() => {
  // Set the initial number of items
  totalRows.value = props.organizations.length;
});
</script>
