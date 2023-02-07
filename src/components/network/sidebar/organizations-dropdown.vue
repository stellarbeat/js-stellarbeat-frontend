<template>
  <div class="sb-nav-item">
    <nav-link
      class="sb-nav-dropdown-title"
      title="Organizations"
      v-on:click="toggleShow"
      :showDropdownToggle="true"
      :dropDownShowing="showing"
      :showIcon="true"
      :show-sub-title="true"
      :sub-title="'Transitive quorum set'"
    >
      <template v-slot:action-dropdown> </template>
    </nav-link>
    <div v-show="showing" class="sb-nav-dropdown">
      <nav-link
        v-for="organization in paginatedOrganizations"
        :key="organization.id"
        v-on:click="selectOrganization(organization)"
        :title="organization.name | truncate(30)"
        :is-link-in-dropdown="true"
        :has-warnings="hasWarnings(organization)"
        :warnings="store.getOrganizationWarningReason(organization)"
        :has-danger="!organization.subQuorumAvailable"
        :dangers="store.getOrganizationFailingReason(organization)"
      >
        <template v-slot:action-dropdown>
          <organization-actions :organization="organization" />
        </template>
      </nav-link>
      <nav-pagination
        v-model="currentPage"
        v-on:input="currentPage = $event"
        :total-rows="organizations.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Organization } from "@stellarbeat/js-stellar-domain";
import NavLink from "@/components/side-bar/nav-link.vue";
import NavPagination from "@/components/side-bar/nav-pagination.vue";
import OrganizationActions from "@/components/organization/sidebar/organization-actions.vue";
import { computed, defineEmits, defineProps } from "vue";
import { useRoute, useRouter } from "vue-router/composables";
import useStore from "@/store/useStore";
import { useDropdown } from "@/components/side-bar/useDropdown";

const props = defineProps<{
  organizations: Organization[];
  expand: boolean;
}>();

const store = useStore();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(["toggleExpand"]);
const { showing, toggleShow, currentPage, paginate } = useDropdown(
  props.expand,
  emit
);

const paginatedOrganizations = computed(() => {
  return paginate(props.organizations).sort(
    (orgA: Organization, orgB: Organization) => {
      if (orgA.name > orgB.name) return 1;
      else return -1;
    }
  );
});

function selectOrganization(organization: Organization) {
  router.push({
    name: "organization-dashboard",
    params: { organizationId: organization.id },
    query: {
      view: route.query.view,
      "no-scroll": "0",
      network: route.query.network,
      at: route.query.at,
    },
  });
}

function hasWarnings(organization: Organization) {
  return store.organizationHasWarnings(organization);
}
</script>

<style scoped></style>
