<template>
  <div class="">
    <slot name="title"></slot>
    <div>
      <b-table
        id="network-analysis-table"
        :items="tableItems"
        :fields="fields"
        :per-page="perPage"
        thead-class="my-thead"
        tbody-class="my-tbody"
        :current-page="currentPage"
      >
        <template #cell()="data">
          <ul class="horizontal-list">
            <li
              class="horizontal-list-item"
              v-for="(item, index) in data.item.key"
              :key="index"
            >
              <span
                v-if="showNodesPartition"
                v-b-tooltip.hover
                :title="
                  nodesPartition.has(item)
                    ? nodesPartition.get(item).join(', ')
                    : 'N/A'
                "
                class="tag mb-1"
                >{{ item }}</span
              >
              <span v-else class="tag mb-1">{{ item }}</span>
            </li>
          </ul>
        </template>
      </b-table>
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="network-analysis-table"
      ></b-pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BTable, BPagination } from "bootstrap-vue";
import { computed, ref, toRefs } from "vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  nodesPartition: {
    type: Map,
    required: true,
  },
  showNodesPartition: {
    type: Boolean,
    default: false,
  },
});

const { title, items } = toRefs(props);

const perPage = ref(5);
const currentPage = ref(1);

const fields = computed(() => {
  return [
    {
      key: "key",
      label: title,
    },
  ];
});

const tableItems = computed(() => {
  return items.value.map((item) => {
    return {
      key: item,
    };
  });
});

const rows = computed(() => {
  return items.value.length;
});
</script>
<style>
.my-thead tr th {
  color: #495057;
  text-transform: none;
  font-size: 0.9375rem;
  font-weight: 700;
}

.my-tbody tr td {
}
.horizontal-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding-bottom: 0;
  margin-bottom: 0;
  padding-left: 0;
}
.horizontal-list-item {
  margin-right: 4px;
}
</style>
