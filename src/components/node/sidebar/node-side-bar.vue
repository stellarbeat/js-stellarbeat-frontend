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
        v-else-if="network.nodeHasWarnings(selectedNode)"
        variant="warning"
        v-b-tooltip="network.getNodeWarningReasons(selectedNode)"
      >
        Warning
      </b-badge>
    </template>
    <template v-slot:explore-list-items>
      <li class="sb-nav-item" v-if="hasOrganization">
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

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import Store from "@/store/Store";
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator";
import QuorumSetDropdown from "@/components/node/sidebar/quorum-set-dropdown.vue";
import NavLink from "@/components/side-bar/nav-link.vue";
import SimulateNewNode from "@/components/node/tools/simulation/simulate-new-node.vue";
import { Node } from "@stellarbeat/js-stellar-domain";
import OrganizationsDropdown from "@/components/network/sidebar/organizations-dropdown.vue";
import OrganizationValidatorsDropdown from "@/components/node/sidebar/organization-validators-dropdown.vue";
import SideBar from "@/components/side-bar/side-bar.vue";
import { BBadge, BModal, VBModal } from "bootstrap-vue";
import QuorumSlices from "@/components/node/tools/quorum-slices.vue";
import useStore from "@/store/useStore";

@Component({
  components: {
    QuorumSlices,
    SideBar,
    OrganizationValidatorsDropdown,
    OrganizationsDropdown,
    SimulateNewNode,
    NavLink,
    QuorumSetDropdown,
    BModal: BModal,
    BBadge: BBadge,
  },
  directives: {
    "b-modal": VBModal,
  },
})
export default class NodeSideBar extends Vue {
  public quorumSetExpanded = true;
  protected tomlNodesExport = "";

  get store(): Store {
    return useStore();
  }

  get selectedNode() {
    if (!this.store.selectedNode) throw new Error("No node selected");
    return this.store.selectedNode;
  }

  get hasOrganization() {
    return (
      this.selectedNode &&
      this.selectedNode.organizationId &&
      this.network.getOrganizationById(this.selectedNode.organizationId)
    );
  }

  get organization() {
    if (this.hasOrganization && this.selectedNode)
      return this.network.getOrganizationById(
        this.selectedNode.organizationId as string
      );
    else return null;
  }

  get network() {
    return this.store.network;
  }

  get nodeType() {
    return this.selectedNode.isValidator
      ? this.selectedNode.isFullValidator
        ? "Full Validator"
        : "Validator"
      : "Watcher";
  }

  loadTomlExport() {
    let stellarCoreConfigurationGenerator =
      new StellarCoreConfigurationGenerator(this.network);
    this.tomlNodesExport = stellarCoreConfigurationGenerator.nodesToToml([
      this.selectedNode,
    ]);
  }

  getDisplayName(node: Node) {
    if (node.name) return node.name;

    return node.publicKey.substr(0, 7) + "..." + node.publicKey.substr(50, 100);
  }
}
</script>
<style scoped></style>
