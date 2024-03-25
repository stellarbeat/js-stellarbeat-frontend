<template>
  <div>
    <div class="page-header d-flex justify-content-between py-3">
      <div class="d-flex align-items-center">
        <h2 class="page-title">Federated Voting</h2>
      </div>
    </div>
    <simulation-control class="card-spacing" />
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
import { Network, Node } from "@stellarbeat/js-stellarbeat-shared";
import { FBASQIRepository } from "@/repositories/implementation/FBASQIRepository";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";

const viewGraph = ref<ViewGraph>(new ViewGraph());
const selectedVertices = ref<ViewVertex[]>([]);

onMounted(async () => {
  const network = await getNetwork();
  const node = new Node("A");
  node.name = "A";
  node.isValidating = true;
  node.active = true;
  node.activeInScp = true;
  node.quorumSet.threshold = 1;
  node.quorumSet.validators.push("sdf1");

  network.nodes.push(node);
  network.recalculateNetwork();

  const trustGraph = network.nodesTrustGraph;
  viewGraph.value = ViewGraph.fromNodes(network, trustGraph, viewGraph.value);
});

const getNetwork = async () => {
  const networkRepository = new FBASQIRepository();
  const networkOrError = await networkRepository.find();
  if (networkOrError.isErr()) {
    return new Network([]);
  }

  return networkOrError.value;
};

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
