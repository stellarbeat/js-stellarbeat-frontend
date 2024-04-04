<template>
  <div>
    <div class="page-header d-flex justify-content-between py-3">
      <div class="d-flex align-items-center">
        <h2 class="page-title">Federated Voting</h2>
      </div>
    </div>
    <simulation-control class="card-spacing" />
    <div class="row">
      <div class="col-md-6">
        <overlay-graph class="card-spacing" />
      </div>
      <div class="col-md-6">
        <div class="card graph">
          <div class="card-body pt-4 pb-0">
            <div
              class="d-flex justify-content-around align-items-baseline border-bottom pt-0 pb-4"
            >
              <div class="title mb-0 pb-0">Trust Graph</div>
            </div>
            <Graph
              ref="graph"
              :selected-vertices="selectedVertices"
              style="height: 400px"
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
          <div class="card-footer pt-0 footer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SimulationControl from "@/components/federated-voting/simulation-control.vue";
import Graph from "@/components/visual-navigator/graph/graph.vue";
import { onMounted, ref } from "vue";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import { Network, TrustGraph } from "@stellarbeat/js-stellarbeat-shared";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import OverlayGraph from "@/components/federated-voting/overlay-graph.vue";
import { federatedVotingStore } from "@/store/useFederatedVotingStore";

const viewGraph = ref<ViewGraph>(new ViewGraph());
const selectedVertices = ref<ViewVertex[]>([]);

const trustGraph = federatedVotingStore.network.nodesTrustGraph;

onMounted(() => {
  viewGraph.value = ViewGraph.fromNodes(
    federatedVotingStore.network as Network,
    trustGraph as TrustGraph,
    viewGraph.value,
  );
});

const handleVertexSelected = (vertex: ViewVertex) => {
  selectedVertices.value = [vertex];
  federatedVotingStore.selectedNodeId = vertex.key;
};
</script>

<style scoped>
.title {
  color: #333;
  font-size: 24px;
  font-weight: bold;
}
.card-spacing {
  margin-bottom: 10px;
}
.footer {
  height: 60px;
}
</style>
