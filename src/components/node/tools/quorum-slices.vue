<template>
  <b-modal
    id="quorumSlicesModal"
    lazy
    v-on:show="loadSlices"
    size="xl"
    hide-header
  >
    <div>
      <b-alert variant="info" show
        >The node itself is added to every slice</b-alert
      >
      <b-table
        id="network-analysis-table"
        striped
        hover
        :fields="fields"
        :items="items"
        :per-page="perPage"
        thead-class="my-thead"
        tbody-class="my-tbody"
        :current-page="currentPage"
      >
        <template #cell(slice)="data">
          {{
            data.item.slice
              .map(
                (publicKey) =>
                  network.getNodeByPublicKey(publicKey).displayName,
              )
              .join(", ")
          }}
        </template>
      </b-table>
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="network-analysis-table"
      ></b-pagination>
    </div>
  </b-modal>
</template>

<script setup lang="ts">
import { BModal, BTable, BPagination, VBToggle, BAlert } from "bootstrap-vue";
import {
  Node,
  QuorumSet,
  QuorumSlicesGenerator,
} from "@stellarbeat/js-stellarbeat-shared";
import Vue, { computed, ref } from "vue";
import useStore from "@/store/useStore";

Vue.directive("b-toggle", VBToggle);

const props = defineProps<{
  selectedNode: Node;
}>();

const store = useStore();
const network = store.network;

const perPage = ref(10);
const currentPage = ref(1);
const items = ref<{ slice: string[] }[]>([]);
const fields = ref<{ key: string; label: string }[]>([
  { key: "slice", label: "slices" },
]);

const rows = computed(() => items.value.length);

function loadSlices() {
  const generator = new QuorumSlicesGenerator();
  const quorumSetWithSelf = new QuorumSet(
    2,
    [props.selectedNode.publicKey],
    [props.selectedNode.quorumSet],
  );
  items.value = generator.getSlices(quorumSetWithSelf).map((slice) => {
    return { slice: Array.from(new Set(slice)) };
  });
}
</script>
<style>
.my-thead tr th {
  color: #495057;
  text-transform: none;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
