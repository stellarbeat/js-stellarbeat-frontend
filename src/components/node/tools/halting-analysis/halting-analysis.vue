<template>
  <b-card>
    <template v-slot:header>
      <h3 class="card-title">Halting analysis for {{ vertex.label }}</h3>
      <div class="card-options">
        <a
          href="#"
          v-on:click.prevent.stop="store.isHaltingAnalysisVisible = false"
          class="card-options-remove"
          data-toggle="card-remove"
        >
          <b-icon-x />
        </a>
      </div>
    </template>
    <div class="row">
      <div class="col-12">
        <b-alert :show="network.isNodeFailing(node)" variant="warning"
          >{{ vertex.label }} is failing.</b-alert
        >
        <div v-if="!network.isNodeFailing(node)">
          <b-form inline>
            <b-form-group
              label-size="sm"
              label="Select number of node failures: "
              label-for="nr-node-failures"
              label-class="mr-1"
              @submit.stop.prevent
            >
              <b-form-input
                id="nr-node-failures"
                :state="numberOfNodeFailuresInputState"
                class="nr-node-failures-input ml-0"
                size="sm"
                v-model="numberOfNodeFailures"
                type="number"
                min="2"
                max="9"
              >
              </b-form-input>
            </b-form-group>
          </b-form>

          <b-button
            size="sm"
            variant="primary"
            @click="restartHaltingAnalysis"
            class="mt-1"
            >Detect failures
          </b-button>
          <b-alert
            dismissible
            :show="numberOfNodeFailures > 4"
            variant="warning"
            class="mt-3"
            >Analyzing combinations of {{ numberOfNodeFailures }} nodes could
            take some time. If possible try with a lower number first.
          </b-alert>
        </div>

        <div v-bind:class="dimmerClass">
          <div class="loader"></div>
          <div class="dimmer-content">
            <div v-if="showAnalysisResult">
              <h3 v-if="nodeFailures.length === 0" class="mt-3">
                Great! No combination of
                {{ numberOfNodeFailures }} validators can bring down
                {{ vertex.label }}
              </h3>
              <div v-else class="mt-3">
                <h3>
                  Found {{ nodeFailures.length }} combinations of validators
                  that can halt
                  {{ vertex.label }}
                </h3>
                <b-form>
                  <b-form-select
                    :disabled="simulated"
                    :select-size="4"
                    v-model="selectedFailure"
                    :options="nodeFailures"
                  ></b-form-select>
                  <b-button
                    v-if="!simulated"
                    size="sm"
                    variant="primary"
                    @click="simulateFailure"
                    class="mt-2"
                    >Simulate failure
                  </b-button>
                  <b-button
                    v-else
                    size="sm"
                    variant="secondary"
                    @click="resetFailureSimulation"
                    class="mt-2"
                    >Reactivate nodes
                  </b-button>
                </b-form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </b-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from "vue";
import {
  NetworkGraphNode,
  QuorumSet as NetworkQuorumSet,
} from "@stellar/halting-analysis/src";
import { PublicKey, QuorumSet, Vertex } from "@stellarbeat/js-stellar-domain";
import {
  BAlert,
  BButton,
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BFormSelect,
  BIconX,
} from "bootstrap-vue";
import { AggregateChange } from "@/services/change-queue/changes/aggregate-change";
import { EntityPropertyUpdate } from "@/services/change-queue/changes/entity-property-update";
import useStore from "@/store/useStore";

const props = defineProps({
  publicKey: { type: String, required: true },
});

const publicKey = toRefs(props).publicKey;

const store = useStore();
const network = store.network;
const showAnalysisResult = ref(false);
const numberOfNodeFailures = ref(2);
const numberOfNodeFailuresInputState = ref<boolean | null>(null);
const nodeFailures = ref<{ value: string[]; text: string }[]>([]);
const selectedFailure = ref<PublicKey[] | null>(null);
const isLoading = ref(false);
const simulated = ref(false);

const haltingAnalysisWorker = new Worker(
  new URL("./../../../../workers/halting-analysisv1.worker.ts", import.meta.url)
);

const dimmerClass = computed(() => {
  return {
    dimmer: true,
    active: isLoading.value,
  };
});

watch(publicKey, () => {
  nodeFailures.value = [];
  selectedFailure.value = null;
  simulated.value = false;
  showAnalysisResult.value = false;
});

const vertex = computed(() => {
  return network.nodesTrustGraph.getVertex(publicKey?.value);
});

const node = computed(() => {
  return network.getNodeByPublicKey(publicKey?.value);
});

function getNetworkGraphNodes() {
  return Array.from(network.nodesTrustGraph.vertices.values()) //todo only nodes in transitive quorum set
    .map((myVertex) =>
      mapVertexToNetworkGraphNode(myVertex, myVertex === vertex.value)
    );
}

function simulateFailure() {
  if (selectedFailure.value === null) {
    return;
  }
  simulated.value = true;
  let aggregateChange = new AggregateChange(
    selectedFailure.value.map(
      (failurePublicKey) =>
        new EntityPropertyUpdate(
          network.getNodeByPublicKey(failurePublicKey),
          "isValidating",
          false
        )
    )
  );

  store.processChange(aggregateChange);
}

function resetFailureSimulation() {
  if (selectedFailure.value === null) {
    return;
  }
  let aggregateChange = new AggregateChange(
    selectedFailure.value.map(
      (failurePublicKey) =>
        new EntityPropertyUpdate(
          network.getNodeByPublicKey(failurePublicKey),
          "isValidating",
          true
        )
    )
  );

  store.processChange(aggregateChange);
  simulated.value = false;
}

function restartHaltingAnalysis() {
  isLoading.value = true;
  simulated.value = false;
  haltingAnalysisWorker.postMessage({
    networkGraphNodes: getNetworkGraphNodes(),
    numberOfNodeFailures: numberOfNodeFailures.value,
  });
}

function mapVertexToNetworkGraphNode(vertex: Vertex, isRoot: boolean) {
  return {
    distance: isRoot ? 0 : 1,
    node: vertex.key,
    status: !network.isNodeFailing(network.getNodeByPublicKey(vertex.key))
      ? "tracking"
      : "missing",
    qset: !network.isNodeFailing(network.getNodeByPublicKey(vertex.key))
      ? mapQuorumSetToNetworkQuorumSet(
          network.getNodeByPublicKey(vertex.key).quorumSet
        )
      : undefined,
  } as NetworkGraphNode;
}

function mapQuorumSetToNetworkQuorumSet(
  quorumSet: QuorumSet
): NetworkQuorumSet {
  let innerQSets = quorumSet.innerQuorumSets.map((innerQSet) =>
    mapQuorumSetToNetworkQuorumSet(innerQSet)
  );
  let v = [];
  v.push(...quorumSet.validators);
  innerQSets.forEach((innerQSet) => v.push(innerQSet));
  return {
    t: quorumSet.threshold,
    v: v,
  };
}

onMounted(() => {
  haltingAnalysisWorker.onmessage = (event: {
    data: { type: string; failures: PublicKey[][] };
  }) => {
    switch (event.data.type) {
      case "end":
        {
          nodeFailures.value = event.data.failures.map(
            (failure: Array<PublicKey>) => {
              return {
                value: failure,
                text: failure
                  .map((publicKey) =>
                    network.getNodeByPublicKey(publicKey).name
                      ? network.getNodeByPublicKey(publicKey).displayName
                      : publicKey.substr(0, 5)
                  )
                  .join(", "),
              };
            }
          );
          if (nodeFailures.value.length > 0) {
            selectedFailure.value = nodeFailures.value[0].value;
          }
          showAnalysisResult.value = true;
          isLoading.value = false;
        }
        break;
    }
  };
});
</script>

<style scoped>
.nr-node-failures-input {
  margin-left: 5px;
  margin-right: 5px;
  width: 45px !important;
}
</style>
