<template>
  <div>
    <simulation-control class="control-spacing" />
    <div class="card graph">
      <Graph
        ref="graph"
        v-on:vertex-selected="handleVertexSelected"
        :selectedVertices="[]"
        style="height: 100%"
        :fullScreen="false"
        :view-graph="viewGraph"
        :is-loading="false"
        :optionShowFailingEdges="true"
        :optionHighlightTrustingNodes="true"
        :optionHighlightTrustedNodes="true"
        :optionShowRegularEdges="true"
        :optionTransitiveQuorumSetOnly="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import SimulationControl from "@/components/federated-voting/simulation-control.vue";
import Graph from "@/components/visual-navigator/graph/graph.vue";
import { onMounted, ref } from "vue";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import { Network } from "@stellarbeat/js-stellarbeat-shared";
import { FBASQIRepository } from "@/repositories/implementation/FBASQIRepository";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";

const viewGraph = ref<ViewGraph>(new ViewGraph());

onMounted(async () => {
  const network = await getNetwork();
  const trustGraph = network.nodesTrustGraph;
  viewGraph.value = ViewGraph.fromNodes(network, trustGraph, viewGraph.value);
  console.log(viewGraph.value.viewEdges);
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
