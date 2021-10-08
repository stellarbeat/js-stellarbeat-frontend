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
      per-page="5"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Network, Node, Organization } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import NodesTable from "@/components/node/nodes-table.vue";
import { BBadge, BIconSearch } from "bootstrap-vue";
import OrganizationsTable from "@/components/organization/organizations-table.vue";

@Component({
  components: {
    OrganizationsTable,
    NodesTable,
    BIconSearch: BIconSearch,
    BBadge: BBadge,
  },
})
export default class NetworkOrganizations extends Vue {
  @Prop()
  node!: Node;

  protected filter = "";

  get fields(): any {
    let fields = [{ key: "name", label: "Node", sortable: true }];
    //@ts-ignore
    fields.push();
    if (!this.store.isSimulation) {
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
  }

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  getFailAt(organization: Organization): number {
    let nrOfValidatingNodes = organization.validators
      .map((validator) => this.network.getNodeByPublicKey(validator))
      .filter((node) => !this.network.isNodeFailing(node)).length;

    return nrOfValidatingNodes - organization.subQuorumThreshold + 1;
  }

  get numberOfActiveOrganizations(): number {
    return this.network.organizations.filter(
      (organization) => organization.subQuorumAvailable
    ).length;
  }

  get organizations(): any[] {
    return this.network.organizations.map((organization) => {
      return {
        name: organization.name,
        id: organization.id,
        failAt: this.getFailAt(organization),
        dangers: this.store.getOrganizationFailingReason(organization),
        blocked: this.network.isOrganizationBlocked(organization),
        subQuorum30DAvailability:
          organization.subQuorum30DaysAvailability + "%",
        isTierOneOrganization: organization.isTierOneOrganization,
      };
    });
  }
}
</script>
