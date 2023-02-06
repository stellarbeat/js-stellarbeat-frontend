<template>
  <Graph
    ref="graph"
    v-on:vertex-selected="vertexSelected"
    :centerVertex="centerVertex"
    :selectedVertices="selectedVertices"
    style="height: 100%"
    :fullScreen="fullScreen"
    :view-graph="viewGraph"
    :is-loading="isLoading"
    :optionShowFailingEdges="optionShowFailingEdges"
    :optionHighlightTrustingNodes="optionHighlightTrustingNodes"
    :optionHighlightTrustedNodes="optionHighlightTrustedNodes"
    :optionShowRegularEdges="optionShowRegularEdges"
    :optionTransitiveQuorumSetOnly="optionTransitiveQuorumSetOnly"
  />
</template>

<script setup lang="ts">
import Graph from "@/components/visual-navigator/graph/graph.vue";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import ViewEdge from "@/components/visual-navigator/graph/view-edge";
import { TrustGraphBuilder } from "@stellarbeat/js-stellar-domain";
import {
  computed,
  defineProps,
  onBeforeUnmount,
  onMounted,
  Ref,
  ref,
  watch,
} from "vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

const router = useRouter();
const route = useRoute();
const viewGraph: Ref<ViewGraph> = ref(new ViewGraph());
let networkId: string;
let computeGraphWorker: Worker;
const isLoading = ref(true);

const props = defineProps({
  type: {
    type: String,
    default: "node",
  },
  optionShowFailingEdges: {
    type: Boolean,
    default: false,
  },
  optionHighlightTrustingNodes: {
    type: Boolean,
    default: true,
  },
  optionHighlightTrustedNodes: {
    type: Boolean,
    default: true,
  },
  optionShowRegularEdges: {
    type: Boolean,
    default: true,
  },
  optionTransitiveQuorumSetOnly: {
    type: Boolean,
    default: true,
  },
  fullScreen: {
    type: Boolean,
    required: true,
  },
});

const type = computed(() => props.type);
const store = useStore();
const network = computed(() => store.network);
const selectedNode = computed(() => store.selectedNode);
const selectedOrganization = computed(() => store.selectedOrganization);
const networkReCalculated = computed(() => store.networkReCalculated);

watch(networkReCalculated, () => {
  if (networkId !== store.networkId) {
    viewGraph.value.reset();
  }
  updateGraph(true);
});

watch(selectedNode, () => {
  reclassify();
});

watch(selectedOrganization, () => {
  reclassify();
});

function reclassify() {
  let mySelectedKeys = selectedKeys.value;
  viewGraph.value.reClassifyEdges(mySelectedKeys);
  viewGraph.value.reClassifyVertices(mySelectedKeys);
}

watch(type, () => {
  updateGraph();
});

function vertexSelected(vertex: ViewVertex) {
  if (type.value === "organization") {
    if (
      route.params.organizationId &&
      route.params.organizationId === vertex.key
    )
      return;

    router.push({
      name: "organization-dashboard",
      params: { organizationId: vertex.key },
      query: {
        center: "0",
        "no-scroll": "1",
        view: route.query.view,
        network: route.query.network,
        at: route.query.at,
      },
    });
  } else {
    if (route.params.publicKey && route.params.publicKey === vertex.key) return;

    router.push({
      name: "node-dashboard",
      params: { publicKey: vertex.key },
      query: {
        center: "0",
        "no-scroll": "1",
        view: route.query.view,
        network: route.query.network,
        at: route.query.at,
      },
    });
  }
}

const selectedKeys = computed(() => {
  let selectedKeys: string[] = [];
  if (type.value === "node") {
    if (store.selectedNode) selectedKeys.push(store.selectedNode.publicKey);
    else if (store.selectedOrganization)
      selectedKeys.push(...store.selectedOrganization.validators);
  } else if (type.value === "organization") {
    if (store.selectedOrganization)
      selectedKeys.push(store.selectedOrganization.id);
    else if (store.selectedNode && store.selectedNode.organizationId) {
      selectedKeys.push(store.selectedNode.organizationId);
    }
  }

  return selectedKeys;
});

function getOrganizationTrustGraph() {
  let trustGraphBuilder = new TrustGraphBuilder(store.network);
  return trustGraphBuilder.buildGraphFromOrganizations(
    store.network.nodesTrustGraph
  );
}

function updateGraph(merge = false) {
  isLoading.value = true;

  if (type.value === "node")
    viewGraph.value = ViewGraph.fromNodes(
      store.network,
      store.network.nodesTrustGraph,
      merge ? viewGraph.value : undefined,
      selectedKeys.value
    );
  else
    viewGraph.value = ViewGraph.fromOrganizations(
      store.network,
      getOrganizationTrustGraph(),
      merge ? viewGraph.value : undefined,
      selectedKeys.value
    );

  computeGraphWorker.postMessage({
    vertices: Array.from(viewGraph.value.viewVertices.values()),
    edges: Array.from(viewGraph.value.viewEdges.values()),
  });
}

const graph = ref(null);
const width = computed(() => {
  if (!graph) return 0;
  //@ts-ignore
  return graph.clientWidth;
});

const height = computed(() => {
  if (!graph) return 0;
  //@ts-ignore
  return graph.clientHeight;
});

const selectedVertices = computed(() => {
  if (selectedKeys.value.length > 0 && viewGraph)
    return selectedKeys.value
      .map((key) => viewGraph.value.viewVertices.get(key))
      .filter((vertex) => vertex !== undefined);
  return [];
});

const centerVertex = computed(() => {
  if (store.centerNode && viewGraph)
    return viewGraph.value.viewVertices.get(store.centerNode.publicKey);
  return undefined;
});

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

onMounted(() => {
  if (type.value === "node")
    viewGraph.value = ViewGraph.fromNodes(
      store.network,
      store.network.nodesTrustGraph,
      undefined,
      selectedKeys.value
    );
  else
    viewGraph.value = ViewGraph.fromOrganizations(
      store.network,
      getOrganizationTrustGraph(),
      undefined,
      selectedKeys.value
    );
  Object.freeze(viewGraph); //not reactive;
  computeGraphWorker = new Worker(
    new URL("./../../workers/compute-graphv9.worker", import.meta.url)
  );
  networkId = store.networkId;

  computeGraphWorker.onmessage = (event: {
    data: { type: string; vertices: ViewVertex[]; edges: ViewEdge[] };
  }) => {
    switch (event.data.type) {
      case "end":
        {
          mapViewGraph(event.data.vertices, event.data.edges);
          isLoading.value = false;
        }
        break;
    }
  };

  computeGraphWorker.postMessage({
    vertices: Array.from(viewGraph.value.viewVertices.values()),
    edges: Array.from(viewGraph.value.viewEdges.values()),
  });
});

onBeforeUnmount(() => {
  computeGraphWorker.terminate();
});
</script>
<style scoped></style>
