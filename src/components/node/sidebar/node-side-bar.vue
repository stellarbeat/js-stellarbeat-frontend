<template>
  <side-bar
    v-if="selectedNode"
    :sticky-key="selectedNode.publicKey"
    icon="bullseye"
    :hasExploreSection="selectedNode.isValidator"
  >
    <template v-slot:title>
      {{ getDisplayName(selectedNode) }}
    </template>
    <template v-slot:sub-title>
      {{ nodeType }}
      <b-badge
        v-if="network.isNodeFailing(selectedNode)"
        variant="danger"
        style="vertical-align: bottom"
        v-b-tooltip="network.getNodeFailingReason(selectedNode).description"
        >{{ network.getNodeFailingReason(selectedNode).label }}
      </b-badge>
      <b-badge
        v-else-if="NodeWarningDetector.nodeHasWarning(selectedNode, network)"
        variant="warning"
        v-b-tooltip="
          NodeWarningDetector.getNodeWarningReasonsConcatenated(
            selectedNode,
            network
          )
        "
      >
        Warning
      </b-badge>
    </template>
    <template v-slot:explore-list-items>
      <li class="sb-nav-item" v-if="hasOrganization && organization">
        <organization-validators-dropdown
          :organization="organization"
          :expand="true"
        />
      </li>
      <li class="sb-nav-item">
        <quorum-set-dropdown
          :quorum-set="selectedNode.quorumSet"
          v-if="selectedNode.isValidator"
          :expand="quorumSetExpanded"
          v-on:toggleExpand="quorumSetExpanded = !quorumSetExpanded"
        />
      </li>
    </template>
    <template v-slot:tool-list-items>
      <li
        class="sb-nav-item"
        v-if="
          selectedNode.isValidator && !network.isValidatorBlocked(selectedNode)
        "
      >
        <nav-link
          :title="
            selectedNode.isValidating ? 'Halt this node' : 'Start validating'
          "
          :show-icon="true"
          :icon="selectedNode.isValidating ? 'lightning-fill' : 'lightning'"
          v-on:click="store.toggleValidating(selectedNode)"
        />
      </li>
      <li class="sb-nav-item">
        <nav-link
          v-b-modal.simulate-node-modal
          :title="'Simulate new node'"
          :show-icon="true"
          icon="plus"
        />
        <simulate-new-node />
      </li>
      <li class="sb-nav-item">
        <nav-link
          :title="'Quorum slices'"
          v-b-modal.quorumSlicesModal
          :show-icon="true"
          icon="search"
        />
      </li>
      <li class="sb-nav-item" v-if="selectedNode.isValidator">
        <nav-link
          title="Halting analysis"
          :show-icon="true"
          icon="gear-wide"
          v-on:click="store.showHaltingAnalysis(selectedNode)"
        />
      </li>
      <quorum-slices :selected-node="selectedNode" />
      <li
        class="sb-nav-item"
        v-if="
          selectedNode.isValidator && store.networkContext.enableConfigExport
        "
      >
        <nav-link
          :title="'Stellar core config'"
          v-b-modal.tomlExportModal
          :show-icon="true"
          icon="download"
        />
      </li>
      <b-modal
        lazy
        size="lg"
        id="tomlExportModal"
        v-on:show="loadTomlExport()"
        title="Stellar Core Config"
        ok-only
        ok-title="Close"
      >
        <pre><code>{{tomlNodesExport}}</code></pre>
      </b-modal>
    </template>
  </side-bar>
</template>

<script setup lang="ts">
import Vue, { computed, ref } from "vue";
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellarbeat-shared/lib/stellar-core-configuration-generator";
import QuorumSetDropdown from "@/components/node/sidebar/quorum-set-dropdown.vue";
import NavLink from "@/components/side-bar/nav-link.vue";
import SimulateNewNode from "@/components/node/tools/simulation/simulate-new-node.vue";
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import OrganizationValidatorsDropdown from "@/components/node/sidebar/organization-validators-dropdown.vue";
import SideBar from "@/components/side-bar/side-bar.vue";
import { BBadge, BModal, VBModal } from "bootstrap-vue";
import QuorumSlices from "@/components/node/tools/quorum-slices.vue";
import useStore from "@/store/useStore";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

Vue.directive("b-modal", VBModal);

const store = useStore();
const quorumSetExpanded = ref(true);
const tomlNodesExport = ref("");

const selectedNode = computed(() => {
  if (!store.selectedNode) throw new Error("No node selected");
  return store.selectedNode;
});

const hasOrganization = computed(() => {
  return (
    selectedNode.value &&
    selectedNode.value.organizationId &&
    store.network.getOrganizationById(selectedNode.value.organizationId)
  );
});

const organization = computed(() => {
  if (hasOrganization.value && selectedNode.value)
    return store.network.getOrganizationById(
      selectedNode.value.organizationId as string
    );
  else return null;
});

const network = store.network;

const nodeType = computed(() => {
  if (selectedNode.value.isValidator)
    return selectedNode.value.isFullValidator ? "Full Validator" : "Validator";
  else return "Watcher";
});

function loadTomlExport() {
  let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(
    network
  );
  tomlNodesExport.value = stellarCoreConfigurationGenerator.nodesToToml([
    selectedNode.value,
  ]);
}

function getDisplayName(node: Node) {
  return node.displayName;
}
</script>
<style scoped></style>
