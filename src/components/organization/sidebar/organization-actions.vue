<template>
  <div>
    <b-dropdown
      right
      size="sm"
      text="More"
      class="p-0 m-0"
      boundary="viewport"
      toggle-class="more-button btn-thin"
      no-caret
    >
      <template slot="button-content">
        <b-icon-three-dots-vertical scale="0.9" />
      </template>
      <b-dropdown-header> Simulation options </b-dropdown-header>
      <div v-if="supportsHalt">
        <b-dropdown-item
          v-if="!store.network.isOrganizationBlocked(organization)"
          v-on:click.prevent.stop="
            store.toggleOrganizationAvailability(organization)
          "
        >
          <b-icon-lightning scale="0.9" />
          {{
            organization.subQuorumAvailable
              ? "Halt this organization"
              : "Start validating"
          }}
        </b-dropdown-item>
        <b-dropdown-text v-else>
          Organization blocked: not enough validators are reaching their
          quorumSet threshold.
        </b-dropdown-text>
      </div>
      <b-dropdown-item
        v-if="supportsDelete"
        v-on:click="
          store.removeOrganizationFromOrganization(
            organization,
            store.selectedOrganization
          )
        "
        @click.prevent.stop
      >
        <b-icon-x-circle scale="0.9" />
        Remove
      </b-dropdown-item>
      <b-dropdown-item
        v-if="supportsAdd"
        v-b-modal="'add-organizations-modal-' + id"
        @click.prevent.stop
      >
        <b-icon-plus-circle scale="0.9" />
        Add organization
      </b-dropdown-item>
    </b-dropdown>
    <b-modal
      lazy
      size="lg"
      :id="'add-organizations-modal-' + id"
      title="Select organization to add"
      ok-title="Add"
      v-on:ok="organizationsToAddModalOk"
    >
      <template slot="default" slot-scope="{ visible }">
        <AddOrganizationsTable
          v-if="visible"
          :organizations="possibleOrganizationsToAdd"
          v-on:organizations-selected="onOrganizationsSelected"
        />
      </template>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import {
  BDropdown,
  BDropdownItem,
  BIconThreeDotsVertical,
  BDropdownHeader,
  BIconXCircle,
  BIconPlusCircle,
  BIconLightning,
  BModal,
  BDropdownText,
  VBModal,
} from "bootstrap-vue";

import { Organization } from "@stellarbeat/js-stellarbeat-shared";
import AddOrganizationsTable from "@/components/node/tools/simulation/add-organizations-table.vue";
import Vue, { computed, ref, Ref, toRefs } from "vue";
import useStore from "@/store/useStore";

Vue.directive("b-modal", VBModal);

interface Props {
  organization: Organization;
  supportsDelete?: boolean;
  supportsAdd?: boolean;
  supportsHalt?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  supportsDelete: false,
  supportsAdd: false,
  supportsHalt: true,
});

const { organization, supportsDelete, supportsAdd, supportsHalt } =
  toRefs(props);

const store = useStore();

const organizationsToAdd: Ref<Organization[]> = ref([]);
const id: Ref<number> = ref(store.getUniqueId());

const trustedOrganizationIds = computed(() => {
  let trustedOrganizationIds = new Set<string>();
  organization.value.validators.forEach((publicKey) => {
    let validator = store.network.getNodeByPublicKey(publicKey);
    store.network
      .getTrustedOrganizations(validator.quorumSet)
      .forEach((org) => {
        if (org.id !== organization.value.id)
          trustedOrganizationIds.add(org.id);
      });
  });
  return Array.from(trustedOrganizationIds);
});

const possibleOrganizationsToAdd = computed(() => {
  return store.network.organizations.filter(
    (organization) => trustedOrganizationIds.value.indexOf(organization.id) < 0
  );
});

function organizationsToAddModalOk() {
  if (organizationsToAdd.value.length > 0) {
    store.addOrganizationsToOrganization(
      organizationsToAdd.value,
      organization.value
    );
  }
}

function onOrganizationsSelected(organizations: Organization[]) {
  organizationsToAdd.value = organizations;
}
</script>
