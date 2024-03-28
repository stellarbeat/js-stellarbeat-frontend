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
            ></path>
          </g>
          <g>
            <g
              v-for="node in nodes"
              :key="'overlay' + node.id"
              :transform="getNodeTransform(node)"
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
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
  Simulation,
  SimulationNodeDatum,
} from "d3-force";
import { federatedVotingStore } from "@/store/useFederatedVotingStore";
import {
  GraphManager,
  LinkDatum,
  NodeDatum,
} from "@/components/federated-voting/GraphManager";
import useGraph from "@/composables/useGraph";
import { useTruncate } from "@/composables/useTruncate";
import OverlayGraphOptions from "@/components/federated-voting/overlay-graph-options.vue";

const initialRepellingForce = 1000;
const initialTopology = "complete";
const overlayGraph = ref<SVGElement | null>(null);
const truncate = useTruncate();
const { getLinkPath, getLabelX, getLabelWidth, getNodeTransform } = useGraph();

let simulation: Simulation<NodeDatum, LinkDatum> | null = null;
const nodes: NodeDatum[] = federatedVotingStore.network.nodes.map(
  (node, i) => ({
    id: i,
    name: node.name ? node.name : node.publicKey,
    x: 0,
    y: 0,
  }),
);

const graphManager = reactive(new GraphManager(nodes, initialTopology));

const charge = forceManyBody().strength(() => -initialRepellingForce);
const linkForce = forceLink(graphManager.links).id(
  (d: SimulationNodeDatum) => (d as NodeDatum).id,
);

onMounted(() => {
  simulation = forceSimulation(graphManager.nodes)
    .force("link", linkForce)
    .force("charge", charge)
    .force("center", forceCenter(width() / 2, height() / 2));
});

const updateRepellingForce = (force: number) => {
  if (simulation) {
    charge.strength(-force);

    simulation.alpha(0.5).restart();
  }
};

const updateTopology = (topology: string) => {
  graphManager.updateGraphTopology(topology);
  if (simulation) {
    simulation.force(
      "link",
      forceLink(graphManager.links).id(
        (d: SimulationNodeDatum) => (d as NodeDatum).id,
      ),
    );
    simulation.alpha(0.5).restart();
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
.repelling-force-label {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.link {
  fill: none;
  stroke: #1687b2;
  stroke-width: 2px;
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
</style>
