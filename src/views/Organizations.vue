<template>
  <div>
    <div>
      <div class="page-header d-flex justify-content-between py-3">
        <div class="d-flex align-items-center">
          <h1 class="page-title">Organizations</h1>
          <simulation-badge />
          <time-travel-badge />
        </div>
        <crawl-time class="" />
      </div>
      <div class="card mb-2 p-1">
        <div class="card-header">
          <div class="row header-row">
            <div class="col-12 col-sm-6">
              <input
                id="searchInput"
                v-model="filter"
                class="form-control search mr-0"
                type="text"
                placeholder="Search"
              />
            </div>
          </div>
        </div>
        <div class="card-body">
          <organizations-table
            :organizations="organizations"
            :fields="fields"
            :filter="filter"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Node, Organization } from "@stellarbeat/js-stellarbeat-shared";
import CrawlTime from "@/components/crawl-time.vue";
import SimulationBadge from "@/components/simulation-badge.vue";
import TimeTravelBadge from "@/components/time-travel-badge.vue";
import OrganizationsTable, {
  TableOrganization,
} from "@/components/organization/organizations-table.vue";
import { computed, ComputedRef, ref } from "vue";
import useStore from "@/store/useStore";
import { OrganizationWarningDetector } from "@/services/OrganizationWarningDetector";
import useMetaTags from "@/composables/useMetaTags";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const store = useStore();
const filter = ref("");
const fields = computed(() => {
  if (store.isSimulation) {
    return [
      { key: "name", sortable: true },
      { key: "validators", sortable: false },
    ];
  } else {
    return [
      { key: "name", sortable: true },
      { key: "validators", sortable: false },
      {
        key: "subQuorum24HAvailability",
        label: "24H Availability",
        sortable: true,
      },
      {
        key: "subQuorum30DAvailability",
        label: "30D Availability",
        sortable: true,
      },
      { key: "url", sortable: true },
      { key: "keybase", sortable: true },
      { key: "email", sortable: true },
    ];
  }
});

const organizations: ComputedRef<TableOrganization[]> = computed(() => {
  return store.network.organizations.map((organization) => {
    return {
      name: organization.name,
      validators: getValidators(organization),
      keybase: organization.keybase,
      github: organization.github,
      url: organization.url,
      email: organization.officialEmail,
      id: organization.id,
      failAt: store.getOrganizationFailAt(organization),
      dangers: store.getOrganizationFailingReason(organization),
      hasWarning: OrganizationWarningDetector.organizationHasWarnings(
        organization,
        store.network,
      ),
      warning: OrganizationWarningDetector.getOrganizationWarningReasons(
        organization,
        store.network,
      ).join(" | "),
      blocked: store.network.isOrganizationBlocked(organization),
      subQuorum24HAvailability: organization.subQuorum24HoursAvailability + "%",
      subQuorum30DAvailability: organization.subQuorum30DaysAvailability + "%",
      isTierOneOrganization: organization.isTierOneOrganization,
    };
  });
});

const getValidators = (organization: Organization) => {
  return organization.validators
    .map((publicKey) => {
      return store.network.getNodeByPublicKey(publicKey);
    })
    .sort((a: Node, b: Node) => a.displayName.localeCompare(b.displayName));
};

useMetaTags("Organizations", "Search through all detected organizations");
</script>

<style scoped>
.header-row {
  width: 100%;
}
</style>
