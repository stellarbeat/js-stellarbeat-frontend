<template>
  <div class="card">
    <div class="card-header pl-3">
      <h1 class="card-title">
        <b-badge variant="success">{{ numberOfActiveOrganizations }}</b-badge>
        available organizations
      </h1>
      <div class="card-options">
        <form>
          <div class="input-group">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Search"
              name="s"
              v-model="filter"
            />
            <div class="input-icon-addon">
              <b-icon-search />
            </div>
          </div>
        </form>
      </div>
    </div>
    <organizations-table
      :filter="filter"
      :organizations="organizations"
      :fields="fields"
      :per-page="5"
    />
  </div>
</template>
<script setup lang="ts">
import { Organization } from "@stellarbeat/js-stellarbeat-shared";
import { BBadge, BIconSearch } from "bootstrap-vue";
import OrganizationsTable from "@/components/organization/organizations-table.vue";
import useStore from "@/store/useStore";
import { computed, ref } from "vue";
const store = useStore();
const network = store.network;
const filter = ref("");

const fields = computed(() => {
  let fields = [{ key: "name", label: "Organization", sortable: true }];

  if (!store.isSimulation && store.networkContext.enableHistory) {
    fields.push({
      key: "subQuorum30DAvailability",
      label: "30D Availability",
      sortable: true,
    });
  }

  fields.push({
    key: "action",
    label: "",
    sortable: false,
    //@ts-ignore
    tdClass: "action",
  });

  return fields;
});

function getFailAt(organization: Organization): number {
  let nrOfValidatingNodes = organization.validators
    .map((validator) => network.getNodeByPublicKey(validator))
    .filter((node) => !network.isNodeFailing(node)).length;

  return nrOfValidatingNodes - organization.subQuorumThreshold + 1;
}

const numberOfActiveOrganizations = computed(() => {
  return network.organizations.filter(
    (organization) => organization.subQuorumAvailable
  ).length;
});

const organizations = computed(() => {
  return network.organizations.map((organization) => {
    return {
      name: organization.name,
      id: organization.id,
      failAt: getFailAt(organization),
      dangers: store.getOrganizationFailingReason(organization),
      blocked: network.isOrganizationBlocked(organization),
      subQuorum30DAvailability: organization.subQuorum30DaysAvailability + "%",
      isTierOneOrganization: organization.isTierOneOrganization,
    };
  });
});
</script>
