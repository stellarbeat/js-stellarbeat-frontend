<template>
  <div>
    <b-dropdown
      ref="dropdown"
      boundary="viewport"
      v-on:click.prevent.stop=""
      right
      text="More"
      class="p-0 m-0"
      toggle-class="more-button btn-thin"
      no-caret
    >
      <template slot="button-content">
        <b-icon-three-dots-vertical scale="0.9" />
      </template>
      <b-dropdown-header id="dropdown-header-label" v-on:click.prevent.stop="">
        Simulation options
      </b-dropdown-header>
      <b-dropdown-item
        v-if="level === 0"
        v-b-modal="'add-organization-modal-' + id"
        v-on:click.prevent.stop
      >
        <b-icon-plus-circle class="dropdown-icon" scale="0.9" />
        Add organization
      </b-dropdown-item>
      <b-dropdown-item
        v-b-modal="'add-validators-modal-' + id"
        v-on:click.prevent.stop
      >
        <b-icon-plus-circle class="dropdown-icon" scale="0.9" />
        Add Validators
      </b-dropdown-item>
      <b-dropdown-item
        v-if="!(level === 2)"
        v-on:click.prevent.stop="addQuorumSet"
      >
        <b-icon-plus-circle class="dropdown-icon" scale="0.9" />
        Add QuorumSet
      </b-dropdown-item>
      <b-dropdown-item
        v-if="!(level === 0)"
        v-on:click.prevent.stop="deleteQuorumSet"
      >
        <b-icon-x-circle class="dropdown-icon" scale="0.9" />
        Delete QuorumSet
      </b-dropdown-item>
      <b-dropdown-form inline v-on:click.prevent.stop="">
        <div class="d-flex align-items-center">
          <b-icon-pencil class="dropdown-icon" scale="0.9" />
          <b-form-group
            label-size="sm"
            label="Threshold"
            label-for="dropdown-edit-threshold"
            @submit.stop.prevent
            v-on:click.prevent.stop
          >
            <b-form-input
              :state="inputState"
              class="thresholdEdit"
              size="sm"
              v-model="newThreshold"
              type="number"
            >
            </b-form-input>
          </b-form-group>
        </div>
        <b-button
          variant="primary"
          size="sm"
          @click="saveThresholdFromInput"
          class="mt-2"
          >Save Threshold
        </b-button>
      </b-dropdown-form>
      <b-dropdown-divider />
      <b-dropdown-item
        v-b-modal="'quorumSetTomlExportModal' + id"
        v-on:click.prevent.stop
      >
        <b-icon-download class="dropdown-icon" scale="0.9" />
        Stellar core config
      </b-dropdown-item>
    </b-dropdown>
    <b-modal
      lazy
      size="lg"
      :id="'add-validators-modal-' + id"
      title="Select validators to add"
      ok-title="Add"
      v-on:ok="validatorsToAddModalOk"
    >
      <template slot="default" slot-scope="{ visible }">
        <AddValidatorsTable
          v-if="visible"
          :validators="possibleValidatorsToAdd"
          v-on:validators-selected="onValidatorsSelected"
        />
      </template>
    </b-modal>
    <b-modal
      lazy
      size="lg"
      :id="'add-organization-modal-' + id"
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
    <b-modal
      lazy
      size="lg"
      :id="'quorumSetTomlExportModal' + id"
      title="Stellar Core Config"
      ok-only
      ok-title="Close"
      v-on:show="loadTomlExport(id)"
    >
      <pre><code>{{tomlNodesExport}}</code></pre>
    </b-modal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import {
  Network,
  Node,
  Organization,
  QuorumSet,
} from "@stellarbeat/js-stellar-domain";
import AddValidatorsTable from "@/components/node/tools/simulation/add-validators-table.vue";
import Store from "@/store/Store";
import {
  BButton,
  BDropdown,
  BDropdownDivider,
  BDropdownForm,
  BDropdownHeader,
  BDropdownItem,
  BFormGroup,
  BFormInput,
  BIconDownload,
  BIconPencil,
  BIconPlusCircle,
  BIconSearch,
  BIconThreeDotsVertical,
  BIconXCircle,
  BModal,
  VBModal,
} from "bootstrap-vue";
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator";
import AddOrganizationsTable from "@/components/node/tools/simulation/add-organizations-table.vue";
import useStore from "@/useStore";

@Component({
  components: {
    AddOrganizationsTable,
    AddValidatorsTable,
    BModal: BModal,
    BIconSearch: BIconSearch,
    BDropdown: BDropdown,
    BDropdownForm: BDropdownForm,
    BButton: BButton,
    BFormGroup: BFormGroup,
    BFormInput: BFormInput,
    BIconPencil: BIconPencil,
    BIconXCircle: BIconXCircle,
    BDropdownItem: BDropdownItem,
    BIconPlusCircle: BIconPlusCircle,
    BDropdownHeader: BDropdownHeader,
    BIconThreeDotsVertical: BIconThreeDotsVertical,
    BIconDownload: BIconDownload,
    BDropdownDivider: BDropdownDivider,
  },
  directives: { "b-modal": VBModal },
})
export default class QuorumSetActions extends Vue {
  @Prop()
  public quorumSet!: QuorumSet;
  @Prop({ default: null })
  public parentQuorumSet!: QuorumSet;
  @Prop()
  public level!: number;

  public editingThreshold = false;
  public newThreshold!: number;
  public id: number = Math.ceil(Math.random() * 1000);
  public validatorsToAdd: string[] = [];
  public organizationsToAdd: Organization[] = [];
  public inputState: boolean | null = null;
  protected tomlNodesExport = "";

  get store(): Store {
    return useStore();
  }

  get network(): Network {
    return this.store.network;
  }

  get selectedNode() {
    return this.store.selectedNode;
  }

  public deleteQuorumSet() {
    this.store.deleteInnerQuorumSet(this.quorumSet, this.parentQuorumSet);
  }

  public get possibleOrganizationsToAdd() {
    let trustedOrganizations = this.network
      .getTrustedOrganizations(this.quorumSet)
      .map((org) => org.id);

    return this.store.network.organizations.filter(
      (organization) => trustedOrganizations.indexOf(organization.id) < 0
    );
  }

  public get possibleValidatorsToAdd() {
    const selectedNode = this.store.selectedNode;
    if (!selectedNode) throw new Error("No selected node");
    return this.store.network.nodes.filter(
      (node: Node) =>
        node.isValidator &&
        QuorumSet.getAllValidators(selectedNode.quorumSet).indexOf(
          node.publicKey
        ) < 0
    );
  }

  public addValidatorsToQuorumSet(
    toQuorumSet: QuorumSet,
    validators: string[]
  ) {
    this.store.addValidators(toQuorumSet, validators);
  }

  public addOrganizationsToQuorumSet(
    toQuorumSet: QuorumSet,
    organizations: Organization[]
  ) {
    this.store.addOrganizations(toQuorumSet, organizations);
  }

  public addQuorumSet() {
    this.store.addInnerQuorumSet(this.quorumSet);
    this.$emit("expand");
  }

  public saveThresholdFromInput() {
    if (this.newThreshold <= 0) {
      this.inputState = false;
      return;
    }

    this.inputState = null;
    this.editingThreshold = false;
    //@ts-ignore
    this.$refs.dropdown.hide(true);
    this.store.editQuorumSetThreshold(
      this.quorumSet,
      Number(this.newThreshold)
    );
  }

  onValidatorsSelected(validators: Node[]) {
    this.validatorsToAdd = validators.map(
      (validator: Node) => validator.publicKey
    );
  }

  onOrganizationsSelected(organizations: Organization[]) {
    this.organizationsToAdd = organizations;
  }

  validatorsToAddModalOk() {
    if (this.validatorsToAdd.length > 0) {
      this.addValidatorsToQuorumSet(this.quorumSet, this.validatorsToAdd);
      this.$emit("expand");
    }
  }

  organizationsToAddModalOk() {
    if (this.organizationsToAdd.length > 0) {
      this.addOrganizationsToQuorumSet(this.quorumSet, this.organizationsToAdd);
    }
  }

  loadTomlExport() {
    let stellarCoreConfigurationGenerator =
      new StellarCoreConfigurationGenerator(this.network);
    this.tomlNodesExport = stellarCoreConfigurationGenerator.quorumSetToToml(
      this.quorumSet
    );
  }

  created() {
    this.newThreshold = this.quorumSet.threshold;
  }
}
</script>

<style scoped>
.inline {
  display: flex !important;
}

.thresholdEdit {
  margin-left: 10px;
  width: 45px !important;
}
</style>
