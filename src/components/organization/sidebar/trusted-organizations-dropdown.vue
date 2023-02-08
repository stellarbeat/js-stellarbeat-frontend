<template>
  <div class="sb-nav-item">
    <nav-link
      class="sb-nav-dropdown-title"
      :title="'Trusted Organizations'"
      v-on:click="toggleShow"
      :showDropdownToggle="true"
      :drop-down-showing="showing"
      :has-warnings="store.someOrganizationsHaveWarnings(trustedOrganizations)"
      :warnings="'Some organizations have warnings'"
    >
      <template v-slot:action-dropdown>
        <organization-actions
          :supports-halt="false"
          :supports-delete="false"
          :supports-add="true"
          :organization="organization"
        />
      </template>
    </nav-link>
    <div v-show="showing" class="sb-nav-dropdown">
      <nav-link
        v-for="organization in trustedOrganizations"
        :key="organization.id"
        v-on:click="selectOrganization(organization)"
        :title="organization.name"
        :is-link-in-dropdown="true"
        :has-danger="network.isOrganizationFailing(organization)"
        :dangers="store.getOrganizationFailingReason(organization)"
        :has-warnings="store.organizationHasWarnings(organization)"
        :warnings="store.getOrganizationWarningReason(organization)"
      >
        <template v-slot:action-dropdown>
          <organization-actions
            :supports-delete="true"
            :organization="organization"
          />
        </template>
      </nav-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Organization } from "@stellarbeat/js-stellar-domain";
import NavLink from "@/components/side-bar/nav-link.vue";
import OrganizationActions from "@/components/organization/sidebar/organization-actions.vue";
import useStore from "@/store/useStore";
import { computed, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router/composables";
import { useDropdown } from "@/composables/useDropdown";

const props = defineProps<{
  organization: Organization;
}>();

const store = useStore();
const network = store.network;
const route = useRoute();
const router = useRouter();

const emit = defineEmits(["toggleExpand"]);
const { showing, toggleShow } = useDropdown(true, emit);

const trustedOrganizations = computed(() => {
  let trustedOrganizations = new Set<Organization>();
  props.organization.validators.forEach((publicKey) => {
    let validator = network.getNodeByPublicKey(publicKey);
    network.getTrustedOrganizations(validator.quorumSet).forEach((org) => {
      if (org.id !== props.organization.id) trustedOrganizations.add(org);
    });
  });
  return Array.from(trustedOrganizations);
});

function selectOrganization(organization: Organization) {
  router.push({
    name: "organization-dashboard",
    params: { organizationId: organization.id },
    query: {
      center: "1",
      "no-scroll": "0",
      view: route.query.view,
      network: route.query.network,
      at: route.query.at,
    },
  });
}
</script>

<style scoped></style>
