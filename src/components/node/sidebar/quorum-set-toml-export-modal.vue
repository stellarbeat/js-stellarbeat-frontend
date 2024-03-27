<template>
  <portal to="quorum-set-modals">
    <div
      :id="'quorumSetTomlExportModal' + id"
      :ref="(el) => (modalRefs[id] = el)"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="quorumSetTomlExportModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="quorumSetTomlExportModalLabel" class="modal-title">
              Stellar Core Config
            </h5>
          </div>
          <div class="modal-body">
            <div class="p-3 bg-light border rounded">
              <pre><code>{{tomlNodesExport}}</code></pre>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-dismiss="modal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>
<script setup lang="ts">
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellarbeat-shared/lib/stellar-core-configuration-generator";
import useStore from "@/store/useStore";
import { nextTick, onMounted, PropType, Ref, ref, toRefs } from "vue";
import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";

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
const tomlNodesExport = ref("");
const modalRefs = ref({} as { [key: string]: Ref<HTMLDivElement> });

function loadTomlExport() {
  const stellarCoreConfigurationGenerator =
    new StellarCoreConfigurationGenerator(network);
  tomlNodesExport.value = stellarCoreConfigurationGenerator.quorumSetToToml(
    quorumSet.value,
  );
}

onMounted(() => {
  nextTick(() => {
    const myModalRef = modalRefs.value[id.value];
    if (myModalRef === undefined) return;

    $(myModalRef).on("show.bs.modal", loadTomlExport);
  });
});
</script>
