<template>
  <portal to="quorum-set-modals">
    <div
      :id="'add-validator-modal-' + id"
      :ref="(el) => (modalRefs[id] = el)"
      class="modal fade"
      tabindex="-1"
      role="dialog"
    >
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Select validators to add</h5>
            <button
              type="button"
              class="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <AddValidatorsTable
              v-if="visible"
              :validators="possibleValidatorsToAdd"
              @validators-selected="onValidatorsSelected"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-dismiss="modal"
              @click="validatorsToAddModalOk"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, PropType, Ref, ref, toRefs } from "vue";
import { Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import useStore from "@/store/useStore";
import AddValidatorsTable from "@/components/node/tools/simulation/add-validators-table.vue";

const emit = defineEmits(["expand"]);

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  quorumSet: {
    type: Object as PropType<QuorumSet>,
    required: true,
  },
});

const { id, quorumSet } = toRefs(props);
const store = useStore();
const network = store.network;
const modalRefs = ref({} as { [key: string]: Ref<HTMLDivElement> });
const visible = ref(false);
const validatorsToAdd = ref<string[]>([]);
const possibleValidatorsToAdd = computed(() => {
  return network.nodes.filter(
    (node: Node) =>
      node.isValidator &&
      QuorumSet.getAllValidators(quorumSet.value).indexOf(node.publicKey) < 0,
  );
});
function onValidatorsSelected(validators: Node[]) {
  validatorsToAdd.value = validators.map(
    (validator: Node) => validator.publicKey,
  );
}
function validatorsToAddModalOk() {
  if (validatorsToAdd.value.length > 0) {
    addValidatorsToQuorumSet(quorumSet.value, validatorsToAdd.value);
    emit("expand");
  }
}
function addValidatorsToQuorumSet(
  toQuorumSet: QuorumSet,
  validators: string[],
) {
  store.addValidators(toQuorumSet, validators);
}

onMounted(() => {
  nextTick(() => {
    const myModalRef = modalRefs.value[id.value];
    if (myModalRef === undefined) return;

    $(myModalRef).on("show.bs.modal", () => {
      visible.value = true;
    });
  });
});
</script>
