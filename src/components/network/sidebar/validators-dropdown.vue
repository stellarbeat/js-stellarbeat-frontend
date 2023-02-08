<template>
  <div class="sb-nav-item">
    <nav-link
      title="Validators"
      v-on:click="toggleShow"
      :showDropdownToggle="true"
      :dropDownShowing="showing"
      :show-sub-title="true"
      :sub-title="'Transitive quorum set'"
      :has-warnings="hasGeneralValidatorsWarning"
      :warnings="generalValidatorsWarning"
    />

    <div v-show="showing" class="sb-nav-dropdown">
      <LazyHydrate when-visible>
        <div>
          <nav-link
            v-for="node in paginatedNodes"
            :key="node.publicKey"
            v-on:click="selectNode(node)"
            :title="getDisplayName(node)"
            :isLinkInDropdown="true"
            :has-warnings="network.nodeHasWarnings(node)"
            :warnings="network.getNodeWarningReasons(node)"
            :has-danger="network.isNodeFailing(node)"
            :dangers="network.getNodeFailingReason(node).label"
          >
            <template v-slot:action-dropdown>
              <node-actions :node="node" />
            </template>
          </nav-link>
          <nav-pagination
            v-model="currentPage"
            v-on:input="currentPage = $event"
            :total-rows="nodes.length"
          />
        </div>
      </LazyHydrate>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Node } from "@stellarbeat/js-stellar-domain";
import NavLink from "@/components/side-bar/nav-link.vue";
import NavPagination from "@/components/side-bar/nav-pagination.vue";
import NodeActions from "@/components/node/sidebar/node-actions.vue";
import LazyHydrate from "vue-lazy-hydration";
import { computed, defineEmits } from "vue";
import useStore from "@/store/useStore";
import { useDropdown } from "@/components/side-bar/useDropdown";
import { useRoute, useRouter } from "vue-router/composables";

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
  emit
);

const sortedNodes = computed(() => {
  let sort = (nodeA: Node, nodeB: Node) => {
    return nodeA.displayName.localeCompare(nodeB.displayName);
  };

  let failingNodes = props.nodes
    .filter((node) => network.isNodeFailing(node))
    .sort(sort);

  let nonFailingNodes = props.nodes
    .filter((node) => !network.isNodeFailing(node))
    .sort(sort);

  return failingNodes.concat(nonFailingNodes);
});

const paginatedNodes = computed(() => {
  return paginate(sortedNodes.value);
});

const hasGeneralValidatorsWarning = computed(() => {
  return (
    props.nodes.some((node) => network.nodeHasWarnings(node)) ||
    props.nodes.some((node) => network.isNodeFailing(node))
  );
});

const generalValidatorsWarning = computed(() => {
  if (props.nodes.some((node) => network.isNodeFailing(node)))
    return "Some nodes are failing";

  if (props.nodes.some((node) => network.historyArchiveHasError(node)))
    return "Verification error in history archive";

  if (
    props.nodes.some((node) =>
      network.isFullValidatorWithOutOfDateArchive(node)
    )
  )
    return "Some history archives not up-to-date";

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
