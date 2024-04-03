<template>
  <portal to="slices-modal">
    <div
      id="quorumSlicesModal"
      ref="quorumSlicesModal"
      class="modal fade"
      tabindex="-1"
      role="dialog"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-body">
            <b-alert variant="info" show
              >The node itself is added to every slice
            </b-alert>
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
                {{ mapSlice(data.item.slice) }}
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
      </div>
    </div>
  </portal>
</template>

<script setup lang="ts">
import $ from "jquery";
import { BAlert, BPagination, BTable, VBToggle } from "bootstrap-vue";
import {
  Node,
  QuorumSet,
  QuorumSlicesGenerator,
} from "@stellarbeat/js-stellarbeat-shared";
import Vue, { computed, nextTick, onMounted, ref } from "vue";
import useStore from "@/store/useStore";

Vue.directive("b-toggle", VBToggle);

const props = defineProps<{
  selectedNode: Node;
}>();

const store = useStore();
const network = store.network;

const quorumSlicesModal = ref<HTMLElement>();

const perPage = ref(10);
const currentPage = ref(1);
const items = ref<{ slice: string[] }[]>([{ slice: ["loading..."] }]);
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

function mapSlice(slice: string[]) {
  return slice
    .map(
      (publicKey: string) => network.getNodeByPublicKey(publicKey).displayName,
    )
    .join(", ");
}

onMounted(() => {
  nextTick(() => {
    if (!quorumSlicesModal.value) return;

    $(quorumSlicesModal.value).on("show.bs.modal", loadSlices);
  });
});
</script>
<style scoped>
.modal {
  z-index: 2000 !important; /* Increase modal z-index */
  top: 0; /* Vertically align to top */
}
</style>
<style>
.my-thead tr th {
  color: #495057;
  text-transform: none;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
