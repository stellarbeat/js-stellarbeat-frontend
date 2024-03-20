<template>
  <div>
    <simulation-control class="control-spacing" />
    <div class="card graph">
      <Graph
        ref="graph"
        v-on:vertex-selected="handleVertexSelected"
        :selectedVertices="selectedVertices"
        style="height: 100%"
        :fullScreen="false"
        :view-graph="viewGraph"
        :is-loading="false"
        :optionShowFailingEdges="true"
        :optionHighlightTrustingNodes="true"
        :optionHighlightTrustedNodes="true"
        :optionShowRegularEdges="true"
        :optionTransitiveQuorumSetOnly="false"
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
import useStore from "@/store/useStore";

const store = useStore();
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
  console.log(viewGraph.value.viewVertices);
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
  console.log("Vertex selected", vertex);
  selectedVertices.value = [vertex];
};
</script>

<style scoped>
.control-spacing {
  margin-bottom: 10px;
}

.graph {
  height: 350px;
}
</style>
