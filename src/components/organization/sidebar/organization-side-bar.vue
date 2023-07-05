<template>
  <side-bar
    v-if="selectedOrganization"
    :sticky-key="selectedOrganization.id"
    icon="building"
  >
    <template v-slot:title>
      {{ selectedOrganization.name }}
    </template>
    <template v-slot:sub-title>
      {{ organizationType }}
      <b-badge
        v-if="network.isOrganizationFailing(selectedOrganization)"
        variant="danger"
        v-b-tooltip:hover="
          store.getOrganizationFailingReason(selectedOrganization)
        "
      >
        {{
          network.isOrganizationBlocked(selectedOrganization)
            ? "Blocked"
            : "Failing"
        }}
      </b-badge>
      <b-badge
        v-else-if="
          OrganizationWarningDetector.organizationHasWarnings(
            selectedOrganization,
            store.network
          )
        "
        variant="warning"
        v-b-tooltip:hover="
          OrganizationWarningDetector.getOrganizationWarningReasons(
            selectedOrganization,
            store.network
          ).join(' | ')
        "
      >
        Warning
      </b-badge>
    </template>
    <template v-slot:explore-list-items>
      <li class="sb-nav-item">
        <organization-validators-dropdown
          :organization="selectedOrganization"
          :expand="true"
        />
      </li>
      <li class="sb-nav-item">
        <trusted-organizations-dropdown
          :organization="selectedOrganization"
          :expand="true"
        />
      </li>
    </template>
    <template v-slot:tool-list-items>
      <li
        class="sb-nav-item"
        v-if="!network.isOrganizationBlocked(selectedOrganization)"
      >
        <nav-link
          :title="
            selectedOrganization.subQuorumAvailable
              ? 'Halt this organization'
              : 'Start validating'
          "
          :show-icon="true"
          :icon="
            selectedOrganization.subQuorumAvailable
              ? 'lightning-fill'
              : 'lightning'
          "
          v-on:click="
            store.toggleOrganizationAvailability(selectedOrganization)
          "
        />
      </li>
      <li class="sb-nav-item" v-if="store.networkContext.enableConfigExport">
        <nav-link
          :title="'Stellar core config'"
          v-b-modal.tomlExportModal
          :show-icon="true"
          icon="download"
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
      <b-modal
        lazy
        size="lg"
        id="tomlExportModal"
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
import Vue, { computed } from "vue";
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellarbeat-shared/lib/stellar-core-configuration-generator";
import OrganizationValidatorsDropdown from "@/components/organization/sidebar/organization-validators-dropdown.vue";
import NavLink from "@/components/side-bar/nav-link.vue";
import SimulateNewNode from "@/components/node/tools/simulation/simulate-new-node.vue";
import SideBar from "@/components/side-bar/side-bar.vue";
import { BModal, VBModal, BBadge, VBTooltip } from "bootstrap-vue";
import TrustedOrganizationsDropdown from "@/components/organization/sidebar/trusted-organizations-dropdown.vue";
import useStore from "@/store/useStore";
import { OrganizationWarningDetector } from "@/services/OrganizationWarningDetector";

Vue.directive("b-modal", VBModal);
Vue.directive("b-tooltip", VBTooltip);

const store = useStore();
const network = store.network;

const selectedOrganization = computed(() => {
  if (!store.selectedOrganization) throw new Error("No organization selected");
  return store.selectedOrganization;
});

const validators = computed(() => {
  return selectedOrganization.value.validators.map((validator) =>
    network.getNodeByPublicKey(validator)
  );
});

const organizationType = computed(() => {
  return selectedOrganization.value.isTierOneOrganization
    ? "T1 Organization"
    : "Organization";
});

const tomlNodesExport = computed(() => {
  let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(
    network
  );
  return stellarCoreConfigurationGenerator.nodesToToml(validators.value);
});
</script>
