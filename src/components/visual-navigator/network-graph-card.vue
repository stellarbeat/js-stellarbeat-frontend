<template>
  <Graph
    ref="graph"
    :center-vertex="centerVertex"
    :selected-vertices="selectedVertices"
    style="height: 100%"
    :full-screen="fullScreen"
    :view-graph="viewGraph"
    :is-loading="isLoading"
    :option-show-failing-edges="optionShowFailingEdges"
    :option-highlight-trusting-nodes="optionHighlightTrustingNodes"
    :option-highlight-trusted-nodes="optionHighlightTrustedNodes"
    :option-show-regular-edges="optionShowRegularEdges"
    :option-transitive-quorum-set-only="optionTransitiveQuorumSetOnly"
    @vertex-selected="vertexSelected"
  />
</template>

<script setup lang="ts">
import Graph from "@/components/visual-navigator/graph/graph.vue";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import { TrustGraphBuilder } from "@stellarbeat/js-stellarbeat-shared";
import {
  computed,
  type ComputedRef,
  onMounted,
  type Ref,
  ref,
  watch,
} from "vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

const router = useRouter();
const route = useRoute();
const viewGraph: Ref<ViewGraph> = ref(new ViewGraph());
let networkId: string;
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
const networkReCalculated = computed(() => store.networkReCalculated);

watch(networkReCalculated, () => {
  if (networkId !== store.networkId) {
    viewGraph.value.reset();
  }
  updateGraph(true);
});

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
  const selectedKeys: string[] = [];
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
  const trustGraphBuilder = new TrustGraphBuilder(store.network);
  return trustGraphBuilder.buildGraphFromOrganizations(
    store.network.nodesTrustGraph,
  );
}

function updateGraph(merge = false) {
  isLoading.value = true;

  if (type.value === "node")
    viewGraph.value = ViewGraph.fromNodes(
      store.network,
      store.network.nodesTrustGraph,
      merge ? viewGraph.value : undefined,
      selectedKeys.value,
    );
  else
    viewGraph.value = ViewGraph.fromOrganizations(
      store.network,
      getOrganizationTrustGraph(),
      merge ? viewGraph.value : undefined,
      selectedKeys.value,
    );
}

const graph = ref(null);

const selectedVertices: ComputedRef<ViewVertex[]> = computed(() => {
  if (selectedKeys.value.length > 0 && viewGraph)
    return selectedKeys.value
      .map((key) => viewGraph.value.viewVertices.get(key))
      .filter((vertex) => vertex !== undefined) as ViewVertex[];
  return [];
});

const centerVertex: ComputedRef<ViewVertex | undefined> = computed(() => {
  if (store.centerNode && viewGraph)
    return viewGraph.value.viewVertices.get(store.centerNode.publicKey);
  return undefined;
});

onMounted(() => {
  if (type.value === "node")
    viewGraph.value = ViewGraph.fromNodes(
      store.network,
      store.network.nodesTrustGraph,
      undefined,
      selectedKeys.value,
    );
  else
    viewGraph.value = ViewGraph.fromOrganizations(
      store.network,
      getOrganizationTrustGraph(),
      undefined,
      selectedKeys.value,
    );
  Object.freeze(viewGraph); //not reactive;

  networkId = store.networkId;
});
</script>
