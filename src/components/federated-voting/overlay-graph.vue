<template>
  <div class="card">
    <div class="card-body">
      <overlay-graph-options
        :initial-repelling-force="initialRepellingForce"
        :initial-topology="initialTopology"
        @updateRepellingForce="updateRepellingForce"
        @updateTopology="updateTopology"
      />
      <div class="chart-container">
        <svg
          ref="overlayGraph"
          class="overlay-graph"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <g>
            <path
              v-for="link in graphManager.links"
              :key="'overlay' + link.source.id + link.target.id"
              class="link"
              :d="getLinkPath(link)"
              @click="() => handleLinkClick(link)"
            ></path>
          </g>
          <g>
            <g
              v-for="node in nodes"
              :key="'overlay' + node.id"
              :transform="getNodeTransform(node)"
              class="node-container"
              @click="() => handleNodeClick(node)"
            >
              <circle class="node" r="8"></circle>
              <g>
                <rect
                  class="label-rect"
                  :width="getLabelWidth(node.name, 10) + 'px'"
                  height="13px"
                  y="10"
                  :x="getLabelX(node.name, 10)"
                  rx="2"
                ></rect>
                <text color="#1687b2" class="label-text" y="5" dy="1.3em">
                  {{ truncate(node.name, 10) }}
                  <title>{{ node.name }}</title>
                </text>
              </g>
            </g>
          </g>
        </svg>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { federatedVotingStore } from "@/store/useFederatedVotingStore";
import {
  GraphManager,
  LinkDatum,
  NodeDatum,
} from "@/components/federated-voting/GraphManager";
import useGraph from "@/composables/useGraph";
import { useTruncate } from "@/composables/useTruncate";
import OverlayGraphOptions from "@/components/federated-voting/overlay-graph-options.vue";
import { SimulationManager } from "@/components/federated-voting/SimulationManager";

const initialRepellingForce = 1000;
const initialTopology = "complete";
const overlayGraph = ref<SVGElement | null>(null);
const truncate = useTruncate();
const { getLinkPath, getLabelX, getLabelWidth, getNodeTransform } = useGraph();

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
    addLinkSourceNode = null;
  } else {
    addLinkSourceNode = node;
  }

  if (simulationManager) {
    simulationManager.updateSimulationLinks(graphManager.links);
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

.link {
  fill: none;
  stroke: #1687b2;
  stroke-width: 2px;
  cursor: pointer;
}

.link:hover {
  stroke-width: 4px;
}

.node {
  fill: #1687b2;
  stroke: #fff;
  stroke-width: 2px;
}

.overlay-graph {
  width: 100%;
  height: 100%;
}

.label-text {
  font-size: 12px;
  text-anchor: middle;
  font-weight: 400;
  fill: #1687b2;
  text-transform: lowercase;
}

.label-rect {
  fill: white;
  opacity: 0.9;
}

.node-container {
  cursor: pointer;
}
</style>
