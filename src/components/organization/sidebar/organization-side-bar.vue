<template>
  <side-bar
    v-if="selectedOrganization"
    :sticky-key="selectedOrganization.id"
    icon="building"
  >
    <template #title>
      {{ selectedOrganization.name }}
    </template>
    <template #sub-title>
      {{ organizationType }}
      <b-badge
        v-if="network.isOrganizationFailing(selectedOrganization)"
        v-tooltip="store.getOrganizationFailingReason(selectedOrganization)"
        variant="danger"
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
            store.network,
          )
        "
        v-tooltip="
          OrganizationWarningDetector.getOrganizationWarningReasons(
            selectedOrganization,
            store.network,
          ).join(' | ')
        "
        variant="warning"
      >
        Warning
      </b-badge>
    </template>
    <template #explore-list-items>
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
    <template #tool-list-items>
      <li
        v-if="!network.isOrganizationBlocked(selectedOrganization)"
        class="sb-nav-item"
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
          @click="store.toggleOrganizationAvailability(selectedOrganization)"
        />
      </li>
      <li v-if="store.networkContext.enableConfigExport" class="sb-nav-item">
        <nav-link
          v-b-modal.tomlExportModal
          :title="'Stellar core config'"
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
        id="tomlExportModal"
        lazy
        size="lg"
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
import { BBadge, BModal, VBModal } from "bootstrap-vue";
import TrustedOrganizationsDropdown from "@/components/organization/sidebar/trusted-organizations-dropdown.vue";
import useStore from "@/store/useStore";
import { OrganizationWarningDetector } from "@/services/OrganizationWarningDetector";

Vue.directive("b-modal", VBModal);

const store = useStore();
const network = store.network;

const selectedOrganization = computed(() => {
  if (!store.selectedOrganization) throw new Error("No organization selected");
  return store.selectedOrganization;
});

const validators = computed(() => {
  return selectedOrganization.value.validators.map((validator) =>
    network.getNodeByPublicKey(validator),
  );
});

const organizationType = computed(() => {
  return selectedOrganization.value.isTierOneOrganization
    ? "T1 Organization"
    : "Organization";
});

const tomlNodesExport = computed(() => {
  const stellarCoreConfigurationGenerator =
    new StellarCoreConfigurationGenerator(network);
  return stellarCoreConfigurationGenerator.nodesToToml(validators.value);
});
</script>
