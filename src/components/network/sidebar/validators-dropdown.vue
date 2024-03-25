<template>
  <div class="sb-nav-item">
    <nav-link
      title="Validators"
      :show-dropdown-toggle="true"
      :drop-down-showing="showing"
      :show-sub-title="true"
      :sub-title="'Transitive quorum set'"
      :has-warnings="hasGeneralValidatorsWarning"
      :warnings="generalValidatorsWarning"
      @click="toggleShow"
    />

    <div v-show="showing" class="sb-nav-dropdown">
      <div>
        <nav-link
          v-for="node in paginatedNodes"
          :key="node.publicKey"
          :title="getDisplayName(node)"
          :is-link-in-dropdown="true"
          :has-warnings="NodeWarningDetector.nodeHasWarning(node, network)"
          :warnings="
            NodeWarningDetector.getNodeWarningReasonsConcatenated(node, network)
          "
          :has-danger="network.isNodeFailing(node)"
          :dangers="network.getNodeFailingReason(node).label"
          @click="selectNode(node)"
        >
          <template #action-dropdown>
            <node-actions :node="node" />
          </template>
        </nav-link>
        <nav-pagination
          v-model="currentPage"
          :total-rows="nodes.length"
          @input="currentPage = $event"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import NavLink from "@/components/side-bar/nav-link.vue";
import NavPagination from "@/components/side-bar/nav-pagination.vue";
import NodeActions from "@/components/node/sidebar/node-actions.vue";
import { computed } from "vue";
import useStore from "@/store/useStore";
import { useDropdown } from "@/composables/useDropdown";
import { useRoute, useRouter } from "vue-router/composables";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

const props = defineProps<{
  nodes: Node[];
  expand: boolean;
}>();
const store = useStore();
const router = useRouter();
const route = useRoute();
const network = store.network;
const emit = defineEmits(["toggleExpand"]);
const { showing, toggleShow, currentPage, paginate } = useDropdown(
  props.expand,
  emit,
);

const sortedNodes = computed(() => {
  const sort = (nodeA: Node, nodeB: Node) => {
    return nodeA.displayName.localeCompare(nodeB.displayName);
  };

  const nodesWithWarningsOrDangers = props.nodes
    .filter(
      (node) =>
        network.isNodeFailing(node) ||
        NodeWarningDetector.nodeHasWarning(node, network),
    )
    .sort(sort);

  const remainingNodes = props.nodes
    .filter(
      (node) =>
        !network.isNodeFailing(node) &&
        !NodeWarningDetector.nodeHasWarning(node, network),
    )
    .sort(sort);

  return nodesWithWarningsOrDangers.concat(remainingNodes);
});

const paginatedNodes = computed(() => {
  return paginate(sortedNodes.value);
});

const hasGeneralValidatorsWarning = computed(() => {
  return (
    props.nodes.some((node) =>
      NodeWarningDetector.nodeHasWarning(node, network),
    ) || props.nodes.some((node) => network.isNodeFailing(node))
  );
});

const generalValidatorsWarning = computed(() => {
  if (props.nodes.some((node) => network.isNodeFailing(node)))
    return "Some nodes are failing";

  if (
    props.nodes.some((node) =>
      NodeWarningDetector.nodeHasWarning(node, network),
    )
  )
    return "Some nodes have warnings";

  return "";
});

function selectNode(node: Node) {
  router.push({
    name: "node-dashboard",
    params: { publicKey: node.publicKey },
    query: {
      center: "1",
      "no-scroll": "0",
      view: route.query.view,
      network: route.query.network,
      at: route.query.at,
    },
  });
}

function getDisplayName(node: Node) {
  return node.displayName;
}
</script>

<style scoped></style>
