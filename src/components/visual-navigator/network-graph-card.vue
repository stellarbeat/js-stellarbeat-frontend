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
    :option-filter-trust-cluster="optionFilterTrustCluster"
    @vertex-selected="vertexSelected"
  />
</template>

<script setup lang="ts">
import Graph from "@/components/visual-navigator/graph/graph.vue";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
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
import { NodeTrustGraphBuilder } from "@/services/NodeTrustGraphBuilder";
import { OrganizationTrustGraphBuilder } from "@/services/OrganizationTrustGraphBuilder";
import { TrustClusterFinder } from "@/services/TrustClusterFinder";
import { Node, Organization } from "@stellarbeat/js-stellarbeat-shared";

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
  optionFilterTrustCluster: {
    type: Boolean,
    default: false,
  },
});

const type = computed(() => props.type);
const includeWatcherNodes = computed(() => store.includeWatcherNodes);
const selectedNode = computed(() => store.selectedNode);
const selectedOrganization = computed(() => store.selectedOrganization);
const optionFilterTrustCluster = computed(() => props.optionFilterTrustCluster);
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

watch(includeWatcherNodes, () => {
  updateGraph();
});

watch(selectedNode, () => {
  if (optionFilterTrustCluster.value) {
    //different selected node, different trust cluster
    updateGraph();
  }
});

watch(selectedOrganization, () => {
  if (optionFilterTrustCluster.value) {
    //different selected organization, different trust cluster
    updateGraph();
  }
});

watch(optionFilterTrustCluster, () => {
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

function updateGraph(merge = false) {
  isLoading.value = true;

  const allNodes = store.includeWatcherNodes
    ? store.network.nodes
    : store.network.nodes.filter((node) => node.isValidator);

  if (type.value === "node") {
    buildNodeViewGraph(allNodes, merge);
  } else {
    buildOrganizationViewGraph(allNodes, merge);
  }
}

function buildNodeViewGraph(allNodes: Node[], merge: boolean) {
  let nodes: Node[] = [];
  if (store.selectedNode && optionFilterTrustCluster.value) {
    nodes = Array.from(
      TrustClusterFinder.find(
        [store.selectedNode],
        new Map(allNodes.map((node) => [node.publicKey, node.quorumSet])),
      ),
    ).map((node) => store.network.getNodeByPublicKey(node));
  } else {
    nodes = allNodes;
  }
  const trustGraph = NodeTrustGraphBuilder.build(nodes);
  viewGraph.value = ViewGraph.fromNodes(
    store.network,
    trustGraph,
    merge ? viewGraph.value : undefined,
    selectedKeys.value,
  );
}

function buildOrganizationViewGraph(allNodes: Node[], merge: boolean) {
  let organizations: Organization[] = [];
  if (store.selectedOrganization && optionFilterTrustCluster.value) {
    organizations = Array.from(
      new Set(
        Array.from(
          TrustClusterFinder.find(
            store.selectedOrganization.validators.map((publicKey) =>
              store.network.getNodeByPublicKey(publicKey),
            ),
            new Map(allNodes.map((node) => [node.publicKey, node.quorumSet])),
          ),
        )
          .map((node) => store.network.getNodeByPublicKey(node).organizationId)
          .filter((organizationId) => organizationId !== null)
          .map((organizationId) =>
            store.network.getOrganizationById(organizationId),
          ),
      ),
    );
  } else {
    organizations = store.network.organizations;
  }
  const trustGraph = OrganizationTrustGraphBuilder.build(
    organizations,
    store.network.organizations,
    allNodes,
  );
  viewGraph.value = ViewGraph.fromOrganizations(
    store.network,
    trustGraph,
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
  updateGraph();
  Object.freeze(viewGraph);
  networkId = store.networkId;
});
</script>
