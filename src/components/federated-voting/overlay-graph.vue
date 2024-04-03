<template>
  <div class="card">
    <div class="card-body pt-4 pb-0">
      <div
        class="title d-flex justify-content-around align-items-baseline border-bottom pb-4"
      >
        Overlay
      </div>

      <div class="chart-container">
        <svg
          ref="overlayGraph"
          class="overlay-graph"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <g>
            <graph-link
              v-for="link in graphManager.links"
              :key="'overlay' + link.source.id + link.target.id"
              :link="link"
              @linkClick="handleLinkClick"
            />
          </g>
          <g>
            <graph-node
              v-for="node in nodes"
              :key="'overlay' + node.id"
              :node="node"
              @nodeClick="handleNodeClick"
            />
          </g>
        </svg>
      </div>
      <div class="card-footer">
        <overlay-graph-options
          :initial-repelling-force="initialRepellingForce"
          :initial-topology="initialTopology"
          @updateRepellingForce="updateRepellingForce"
          @updateTopology="updateTopology"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { federatedVotingStore } from "@/store/useFederatedVotingStore";
import {
  GraphManager,
  type LinkDatum,
  type NodeDatum,
} from "@/components/federated-voting/GraphManager";
import OverlayGraphOptions from "@/components/federated-voting/overlay-graph-options.vue";
import { SimulationManager } from "@/components/federated-voting/SimulationManager";
import GraphLink from "@/components/federated-voting/graph-link.vue";
import GraphNode from "@/components/federated-voting/graph-node.vue";

const initialRepellingForce = 1000;
const initialTopology = "complete";
const overlayGraph = ref<SVGElement | null>(null);

let simulationManager: SimulationManager | null = null;

let addLinkSourceNode: NodeDatum | null = null;

const handleLinkClick = (link: LinkDatum) => {
  graphManager.removeLink(link);
  if (simulationManager) {
    simulationManager.updateSimulationLinks(graphManager.links);
  }
};

const handleNodeClick = (node: NodeDatum) => {
  if (addLinkSourceNode) {
    graphManager.addLink(addLinkSourceNode, node);
    if (simulationManager)
      simulationManager.updateSimulationLinks(graphManager.links);
    addLinkSourceNode = null;
  } else {
    addLinkSourceNode = node;
  }
};

const nodes: NodeDatum[] = federatedVotingStore.network.nodes.map(
  (node, i) => ({
    id: i,
    name: node.name ? node.name : node.publicKey,
    x: 0,
    y: 0,
  }),
);

const graphManager = reactive(new GraphManager(nodes, initialTopology));

onMounted(() => {
  simulationManager = new SimulationManager(
    graphManager.nodes,
    graphManager.links,
    initialRepellingForce,
    width(),
    height(),
  );
});

const updateRepellingForce = (force: number) => {
  if (simulationManager) {
    simulationManager.updateSimulationForce(force);
  }
};

const updateTopology = (topology: string) => {
  graphManager.updateGraphTopology(topology);
  if (simulationManager) {
    simulationManager.updateSimulationLinks(graphManager.links);
  }
};

const width = (): number => {
  if (!overlayGraph.value) return 0;
  return overlayGraph.value.clientWidth;
};

const height = (): number => {
  if (!overlayGraph.value) return 0;
  return overlayGraph.value.clientHeight;
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
.overlay-graph {
  width: 100%;
  height: 100%;
}
.title {
  color: #333;
  font-size: 24px;
  font-weight: bold;
}
</style>
