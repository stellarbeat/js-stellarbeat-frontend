<template>
  <div v-bind:class="dimmerClass" style="height: 100%">
    <div class="loader"></div>
    <div class="dimmer-content svg-wrapper h-100">
      <svg
        class="graph"
        xmlns="http://www.w3.org/2000/svg"
        ref="graphSvg"
        width="100%"
        height="100%"
      >
        <g ref="grid">
          <g v-if="!isLoading && viewGraph">
            <path
              class="edge"
              v-for="edge in viewGraph.regularEdges.filter(
                (mEdge) =>
                  (!mEdge.isFailing || optionShowFailingEdges) &&
                  (mEdge.isPartOfTransitiveQuorumSet ||
                    !optionTransitiveQuorumSetOnly)
              )"
              :key="edge.key"
              v-bind:d="getEdgePath(edge)"
              :class="getEdgeClassObject(edge)"
            />
            <path
              class="edge"
              v-for="edge in viewGraph.stronglyConnectedEdges.filter(
                (mEdge) =>
                  (!mEdge.isFailing || optionShowFailingEdges) &&
                  (mEdge.isPartOfTransitiveQuorumSet ||
                    !optionTransitiveQuorumSetOnly)
              )"
              :key="edge.key"
              v-bind:d="getEdgePath(edge)"
              :class="getEdgeClassObject(edge)"
            />
            <g
              v-if="
                selectedVertices &&
                selectedVertices.length > 0 &&
                optionHighlightTrustingNodes
              "
            >
              <path
                class="edge incoming"
                v-for="edge in viewGraph.trustingEdges.filter(
                  (mEdge) =>
                    (!mEdge.isFailing || optionShowFailingEdges) &&
                    (mEdge.isPartOfTransitiveQuorumSet ||
                      !optionTransitiveQuorumSetOnly)
                )"
                :key="edge.key + edge.key"
                v-bind:d="getEdgePath(edge)"
              />
            </g>
            <g
              v-if="
                selectedVertices &&
                selectedVertices.length > 0 &&
                optionHighlightTrustedNodes
              "
            >
              <path
                class="edge outgoing"
                v-for="edge in viewGraph.trustedEdges.filter(
                  (mEdge) =>
                    (!mEdge.isFailing || optionShowFailingEdges) &&
                    (mEdge.isPartOfTransitiveQuorumSet ||
                      !optionTransitiveQuorumSetOnly)
                )"
                :key="edge.key + edge.key"
                v-bind:d="getEdgePath(edge)"
              />
            </g>
            <graph-strongly-connected-component
              :greatest="true"
              :vertex-coordinates="viewGraph.transitiveQuorumSetCoordinates"
            />
            <g v-if="!optionTransitiveQuorumSetOnly">
              <graph-strongly-connected-component
                :key="index"
                v-for="(
                  sccCoordinates, index
                ) in viewGraph.stronglyConnectedComponentCoordinates"
                :vertex-coordinates="sccCoordinates"
              />
            </g>
            <g
              :transform="getVertexTransform(vertex)"
              class="vertex"
              style="cursor: pointer"
              v-for="vertex in Array.from(
                viewGraph.viewVertices.values()
              ).filter(
                (mVertex) =>
                  mVertex.isPartOfTransitiveQuorumSet ||
                  !optionTransitiveQuorumSetOnly
              )"
              :key="vertex.key"
              v-on:click="vertexSelected(vertex)"
            >
              <circle :r="5" v-bind:class="getVertexClassObject(vertex)">
                <title>{{ vertex.label }}</title>
              </circle>
              <g>
                <rect
                  style="fill: white; opacity: 0.7; text-transform: lowercase"
                  :width="getVertexTextRectWidthPx(vertex)"
                  height="13px"
                  y="10"
                  :x="getVertexTextRectX(vertex)"
                  rx="2"
                  :class="{
                    'rect-selected': vertex.selected,
                    rect: !vertex.selected,
                  }"
                ></rect>
                <text
                  y="5"
                  :class="getVertexTextClass(vertex)"
                  dy="1.3em"
                  text-anchor="middle"
                  font-size="12px"
                >
                  {{ truncate(vertex.label, 10) }}
                  <title>{{ vertex.label }}</title>
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as zoom from "d3-zoom";
import { select, Selection } from "d3-selection";
import GraphStronglyConnectedComponent from "@/components/visual-navigator/graph/graph-strongly-connected-component.vue";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import ViewEdge from "@/components/visual-navigator/graph/view-edge";
import { isObject } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";
import {
  computed,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  toRefs,
  watch,
} from "vue";
import { useTruncate } from "@/composables/useTruncate";

const props = defineProps({
  centerVertex: {
    type: Object as PropType<ViewVertex>,
    required: false,
  },
  selectedVertices: {
    type: Array as PropType<ViewVertex[]>,
    required: true,
  },
  optionShowFailingEdges: {
    type: Boolean,
    required: true,
  },
  optionHighlightTrustingNodes: {
    type: Boolean,
    required: true,
  },
  optionHighlightTrustedNodes: {
    type: Boolean,
    required: true,
  },
  optionShowRegularEdges: {
    type: Boolean,
    required: true,
  },
  optionTransitiveQuorumSetOnly: {
    type: Boolean,
    required: true,
  },
  fullScreen: {
    type: Boolean,
    required: true,
  },
  viewGraph: {
    type: Object as PropType<ViewGraph>,
    required: true,
  },
});

const {
  centerVertex,
  fullScreen,
  selectedVertices,
  viewGraph,
  optionHighlightTrustingNodes,
  optionHighlightTrustedNodes,
  optionShowFailingEdges,
} = toRefs(props);
let computeGraphWorker: Worker;
const isLoading = ref(true);
const emit = defineEmits(["vertex-selected"]);
const truncate = useTruncate();

let d3svg: Selection<Element, null, null, undefined>;
let d3Grid: Selection<Element, null, null, undefined>;
/* eslint-disable  @typescript-eslint/no-explicit-any */
let graphZoom: any;

watch(
  () => props.centerVertex,
  () => {
    centerCorrectVertex();
  }
);

watch(viewGraph, () => {
  isLoading.value = true;
  computeGraphWorker.postMessage({
    vertices: Array.from(viewGraph.value.viewVertices.values()),
    edges: Array.from(viewGraph.value.viewEdges.values()),
  });
});

watch(fullScreen, () => {
  centerCorrectVertex();
  transformAndZoom();
});

watch(isLoading, () => {
  centerCorrectVertex();
});

function vertexSelected(vertex: ViewVertex) {
  emit("vertex-selected", vertex);
}

function getVertexTransform(vertex: ViewVertex): string {
  return `translate(${vertex.x},${vertex.y})`;
}

function getVertexTextRectWidth(vertex: ViewVertex) {
  return (truncate(vertex.label, 10).length / 10) * 60;
}

function getVertexTextRectWidthPx(vertex: ViewVertex) {
  return getVertexTextRectWidth(vertex) + "px";
}

function getVertexTextRectX(vertex: ViewVertex) {
  return "-" + getVertexTextRectWidth(vertex) / 2 + "px";
}

function getVertexTextClass(vertex: ViewVertex) {
  return {
    active: !vertex.isFailing,
    failing: vertex.isFailing,
    selected: vertex.selected,
  };
}

function getVertexClassObject(vertex: ViewVertex) {
  return {
    active: !vertex.isFailing,
    selected: vertex.selected,
    failing: vertex.isFailing,
    target: highlightVertexAsIncoming(vertex) && !vertex.selected,
    source:
      highlightVertexAsOutgoing(vertex) &&
      !vertex.selected &&
      !highlightVertexAsIncoming(vertex),
    transitive: vertex.isPartOfTransitiveQuorumSet,
  };
}

function highlightVertexAsOutgoing(vertex: ViewVertex) {
  if (selectedVertices?.value.length <= 0) return false;
  let edges = selectedVertices?.value
    .map((selectedVertex) =>
      viewGraph?.value.viewEdges.get(vertex.key + ":" + selectedVertex.key)
    )
    .filter((edge) => edge !== undefined);
  let allEdgesAreFailing = edges.every((edge) => (edge as ViewEdge).isFailing);

  if (edges.length <= 0) return false;

  return (
    vertex.isTrustingSelectedVertex &&
    optionHighlightTrustingNodes?.value &&
    (!allEdgesAreFailing || optionShowFailingEdges?.value)
  );
}

function highlightVertexAsIncoming(vertex: ViewVertex) {
  if (selectedVertices?.value.length <= 0) return false;

  let edges = selectedVertices?.value
    .map((selectedVertex) =>
      viewGraph?.value.viewEdges.get(selectedVertex.key + ":" + vertex.key)
    )
    .filter((edge) => edge !== undefined);
  let allEdgesAreFailing = edges.every((edge) => (edge as ViewEdge).isFailing);

  if (edges.length <= 0) return false;

  return (
    vertex.isTrustedBySelectedVertex &&
    optionHighlightTrustedNodes?.value &&
    (!allEdgesAreFailing || optionShowFailingEdges?.value)
  );
}

const graphSvg = ref<SVGElement | null>(null);

function width() {
  return (graphSvg.value as SVGElement).clientWidth;
}

function height() {
  return (graphSvg.value as SVGElement).clientHeight;
}

const dimmerClass = computed(() => {
  return {
    dimmer: true,
    active: isLoading?.value,
  };
});

function centerCorrectVertex() {
  if (centerVertex?.value instanceof ViewVertex) {
    const realVertexX = -centerVertex.value.x + width() / 2;
    const realVertexY = -centerVertex.value.y + height() / 2;

    let transform = zoom.zoomIdentity
      .translate(realVertexX, realVertexY)
      .scale(1);
    d3svg.call(graphZoom.transform, transform);
  }
}
function mapViewGraph(vertices: ViewVertex[], edges: ViewEdge[]) {
  vertices.forEach((updatedVertex: ViewVertex) => {
    let vertex = viewGraph.value.viewVertices.get(updatedVertex.key);
    if (!vertex) return;
    vertex.x = updatedVertex.x;
    vertex.y = updatedVertex.y;
  });

  edges.forEach((updatedEdge: ViewEdge) => {
    let edge = viewGraph.value.viewEdges.get(updatedEdge.key);
    if (!edge) return;
    edge.source = updatedEdge.source;
    edge.target = updatedEdge.target;
  });
}

const grid = ref<Element | null>(null);
onMounted(() => {
  computeGraphWorker = new Worker(
    new URL("./../../../workers/compute-graphv9.worker", import.meta.url)
  );
  computeGraphWorker.onmessage = (event: {
    data: { type: string; vertices: ViewVertex[]; edges: ViewEdge[] };
  }) => {
    if (event.data.type === "end") {
      {
        mapViewGraph(event.data.vertices, event.data.edges);
        isLoading.value = false;
      }
    }
  };

  d3Grid = select(grid.value as Element);
  d3svg = select(graphSvg.value as Element);
  graphZoom = zoom
    .zoom()
    .on("zoom", (event) => {
      d3Grid.attr("transform", event.transform);
    })
    .scaleExtent([1, 3])
    .translateExtent([
      [-width(), -height()],
      [width(), height()],
    ]);
  transformAndZoom();
});

function transformAndZoom() {
  let transform = zoom.zoomIdentity
    .translate(width() / 2, height() / 2)
    .scale(1);
  d3svg.call(graphZoom).call(graphZoom.transform, transform);
}

function getEdgeClassObject(edge: ViewEdge) {
  return {
    "strongly-connected": edge.isPartOfStronglyConnectedComponent,
    failing: edge.isFailing,
  };
}

function getEdgePath(edge: ViewEdge) {
  if (!isObject(edge.source))
    throw new Error("Edge source not transformed into object by D3");
  if (!isObject(edge.target))
    throw new Error("Edge target not transformed into object by D3");
  return (
    "M" +
    edge.source.x +
    " " +
    edge.source.y +
    " L" +
    edge.target.x +
    " " +
    edge.target.y
  );
}
onBeforeUnmount(() => {
  computeGraphWorker.terminate();
});
</script>

<style lang="scss" scoped>
@import "src/assets/custom";

svg.graph {
  width: 100%;
  cursor: grab;
}

.dimmer.active .dimmer-content {
  opacity: 0.4;
}

path.edge {
  stroke: $graph-primary;
  stroke-width: 0.5px;
  stroke-opacity: 0.07;
  fill-opacity: 0;
}

path.strongly-connected {
  stroke: $graph-primary;
  stroke-width: 0.7px;
  stroke-opacity: 0.25;
}

path.failing {
  stroke: $red;
}

path.outgoing {
  stroke: #fec601;
  stroke-opacity: 0.9;
  stroke-width: 1.3px;
}

path.incoming {
  stroke: #73bfb8;
  stroke-opacity: 0.9;
  stroke-width: 1.3px;
}

circle.active {
  fill: $graph-primary;
}

circle.transitive {
  fill: $graph-primary;
}

circle.selected {
  stroke: $yellow;
  opacity: 0.6;
}

circle.failing {
  fill: $red;
}

circle.target {
  stroke: #fec601;
  stroke-opacity: 1;
}

circle.source {
  stroke: #73bfb8;
  stroke-opacity: 1;
}

circle {
  stroke: $white;
  fill: $gray-100;
  cursor: pointer;
  stroke-width: 1.5px;
}

text {
  fill: $graph-primary;
  font-weight: 400;
}

.failing {
  fill: $red;
  opacity: 0.7;
}

.selected {
  font-weight: bold;
}

.rect {
  opacity: 0.8;
}

.rect-selected {
  stroke: yellow;
  stroke-width: 1.5;
}
</style>
