<template>
  <div>
    <div class="page-header d-flex justify-content-between py-3">
      <div class="d-flex align-items-center">
        <h2 class="page-title">Federated Voting</h2>
      </div>
    </div>
    <simulation-control class="card-spacing" />
    <overlay-graph class="card-spacing" />
    <div class="card graph">
      <Graph
        ref="graph"
        :selected-vertices="selectedVertices"
        style="height: 100%"
        :full-screen="false"
        :view-graph="viewGraph"
        :is-loading="false"
        :option-show-failing-edges="true"
        :option-highlight-trusting-nodes="true"
        :option-highlight-trusted-nodes="true"
        :option-show-regular-edges="true"
        :option-transitive-quorum-set-only="false"
        :initial-zoom="2"
        :propagation-enabled="true"
        @vertex-selected="handleVertexSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SimulationControl from "@/components/federated-voting/simulation-control.vue";
import Graph from "@/components/visual-navigator/graph/graph.vue";
import { onMounted, ref } from "vue";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import OverlayGraph from "@/components/federated-voting/overlay-graph.vue";
import { federatedVotingStore } from "@/store/useFederatedVotingStore";

const viewGraph = ref<ViewGraph>(new ViewGraph());
const selectedVertices = ref<ViewVertex[]>([]);

const node = new Node("A");
node.name = "A";
node.isValidating = true;
node.active = true;
node.activeInScp = true;
node.quorumSet.threshold = 1;
node.quorumSet.validators.push("sdf1");

federatedVotingStore.network.nodes.push(node);
federatedVotingStore.network.recalculateNetwork();

const trustGraph = federatedVotingStore.network.nodesTrustGraph;

onMounted(() => {
  viewGraph.value = ViewGraph.fromNodes(
    federatedVotingStore.network,
    trustGraph,
    viewGraph.value,
  );
});

const handleVertexSelected = (vertex: ViewVertex) => {
  selectedVertices.value = [vertex];
};
</script>

<style scoped>
.card-spacing {
  margin-bottom: 10px;
}

.graph {
  height: 450px;
}
</style>
