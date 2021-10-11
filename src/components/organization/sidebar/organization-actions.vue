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
          v-if="!network.isOrganizationBlocked(organization)"
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

<script lang="ts">
import { Component, Mixins, Prop } from "vue-property-decorator";
import {
  BDropdown,
  BDropdownItem,
  BIconThreeDotsVertical,
  BDropdownHeader,
  BIconXCircle,
  BIconPlusCircle,
  BIconGearWide,
  BIconLightning,
  BDropdownItemButton,
  BModal,
  BDropdownText,
  VBModal,
} from "bootstrap-vue";

import { Organization } from "@stellarbeat/js-stellar-domain";
import AddOrganizationsTable from "@/components/node/tools/simulation/add-organizations-table.vue";
import { StoreMixin } from "@/mixins/StoreMixin";

@Component({
  components: {
    AddOrganizationsTable,
    BDropdown,
    BDropdownText,
    BDropdownItem,
    BIconThreeDotsVertical,
    BDropdownHeader,
    BIconXCircle,
    BIconGearWide,
    BIconLightning,
    BDropdownItemButton,
    BIconPlusCircle,
    BModal,
  },
  directives: { "b-modal": VBModal },
})
export default class OrganizationActions extends Mixins(StoreMixin) {
  @Prop()
  public organization!: Organization;
  @Prop({ default: false })
  public supportsDelete!: boolean;
  @Prop({ default: false })
  public supportsAdd!: boolean;
  @Prop({ default: true })
  public supportsHalt!: boolean;

  public organizationsToAdd: Organization[] = [];
  public id!: number;

  get trustedOrganizationIds() {
    let trustedOrganizationIds = new Set<string>();
    this.organization.validators.forEach((publicKey) => {
      let validator = this.network.getNodeByPublicKey(publicKey);
      this.network
        .getTrustedOrganizations(validator.quorumSet)
        .forEach((org) => {
          if (org.id !== this.organization.id)
            trustedOrganizationIds.add(org.id);
        });
    });
    return Array.from(trustedOrganizationIds);
  }

  public get possibleOrganizationsToAdd() {
    return this.store.network.organizations.filter(
      (organization) => this.trustedOrganizationIds.indexOf(organization.id) < 0
    );
  }

  organizationsToAddModalOk() {
    if (this.organizationsToAdd.length > 0) {
      this.store.addOrganizationsToOrganization(
        this.organizationsToAdd,
        this.organization
      );
    }
  }

  onOrganizationsSelected(organizations: Organization[]) {
    this.organizationsToAdd = organizations;
  }

  created() {
    this.id = this.store.getUniqueId();
  }
}
</script>
