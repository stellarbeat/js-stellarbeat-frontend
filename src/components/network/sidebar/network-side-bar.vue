<template>
  <side-bar
    :sticky-key="'stellar-public'"
    icon="house"
    :has-info-section="true"
  >
    <template v-slot:title>
      {{ store.getNetworkContextName() }}
    </template>
    <template v-slot:sub-title>
      Overview
      <b-badge v-if="store.networkAnalyzer.manualMode" variant="default"
        >Risks not analyzed</b-badge
      >
      <b-badge
        v-else-if="store.networkHasDangers()"
        variant="danger"
        style="vertical-align: bottom"
        v-b-tooltip.hover.right="store.getNetworkDangers().description"
        >{{ store.getNetworkDangers().label }}
      </b-badge>
      <b-badge
        v-else-if="store.networkHasWarnings()"
        variant="warning"
        style="vertical-align: bottom"
        v-b-tooltip.hover.right="store.getNetworkWarnings().description"
        >{{ store.getNetworkWarnings().label }}
      </b-badge>
    </template>
    <template v-slot:explore-list-items>
      <li
        v-if="networkTransitiveQuorumSetOrganizations.length > 0"
        class="sb-nav-item"
      >
        <organizations-dropdown
          :organizations="networkTransitiveQuorumSetOrganizations"
          :expand="organizationsExpanded"
        />
      </li>
      <li class="sb-nav-item">
        <validators-dropdown
          :nodes="networkTransitiveQuorumSetNodes"
          :expand="validatorsExpanded"
        />
      </li>
    </template>
    <template v-slot:tool-list-items>
      <li class="sb-nav-item" v-if="store.networkContext.enableConfigExport">
        <nav-link
          :title="'Stellar core quorum set'"
          v-b-modal.tomlExportModal
          :show-icon="true"
          icon="download"
        />
      </li>
      <b-modal
        lazy
        size="lg"
        id="tomlExportModal"
        title="Stellar Core quorum set"
        ok-only
        ok-title="Close"
      >
        <pre><code>{{tomlNodesExport}}</code></pre>
      </b-modal>
      <li class="sb-nav-item">
        <nav-link
          title="Horizon APIs"
          :show-icon="true"
          icon="broadcast"
          v-on:click="scrollToHorizonCard()"
        ></nav-link>
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
          title="Network analysis"
          :show-icon="true"
          icon="gear"
          v-on:click="store.isNetworkAnalysisVisible = true"
        />
      </li>
      <li class="sb-nav-item">
        <nav-link
          title="Modify Network"
          :show-icon="true"
          icon="pencil"
          v-on:click="$refs['modifyNetwork'].showModal()"
        />
        <modify-network ref="modifyNetwork" />
      </li>
    </template>
  </side-bar>
</template>

<script setup lang="ts">
import Vue, { computed, ref } from "vue";
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellarbeat-shared/lib/stellar-core-configuration-generator";
import SimulateNewNode from "@/components/node/tools/simulation/simulate-new-node.vue";
import ValidatorsDropdown from "@/components/network/sidebar/validators-dropdown.vue";
import NavLink from "@/components/side-bar/nav-link.vue";
import OrganizationsDropdown from "@/components/network/sidebar/organizations-dropdown.vue";
import SideBar from "@/components/side-bar/side-bar.vue";

import { BModal, VBModal, BBadge, VBTooltip, BIconHouse } from "bootstrap-vue";
import ModifyNetwork from "@/components/network/tools/modify-network.vue";
import useStore from "@/store/useStore";
import VueScrollTo from "vue-scrollto";
Vue.directive("b-modal", VBModal);
Vue.directive("b-tooltip", VBTooltip);
Vue.component("BIconHouse", BIconHouse);

const organizationsExpanded = ref(true);
const store = useStore();
const network = store.network;

const networkTransitiveQuorumSetNodes = computed(() => {
  return Array.from(network.nodesTrustGraph.networkTransitiveQuorumSet).map(
    (publicKey) => network.getNodeByPublicKey(publicKey)
  );
});

const networkTransitiveQuorumSetOrganizations = computed(() => {
  return [
    ...new Set(
      networkTransitiveQuorumSetNodes.value
        .filter((node) => node && node.organizationId)
        .map((node) =>
          network.getOrganizationById(node.organizationId as string)
        )
    ),
  ];
});
const validatorsExpanded = ref(
  networkTransitiveQuorumSetOrganizations.value.length === 0
);
const tomlNodesExport = computed(() => {
  let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(
    network
  );
  return stellarCoreConfigurationGenerator.nodesToToml(
    networkTransitiveQuorumSetNodes.value
  );
});

function scrollToHorizonCard() {
  VueScrollTo.scrollTo("#public-horizon-apis-card");
}
</script>
