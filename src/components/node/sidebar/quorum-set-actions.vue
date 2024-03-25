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
      v-on:show="loadTomlExport()"
    >
      <pre><code>{{tomlNodesExport}}</code></pre>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import Vue, { computed, ref, toRefs } from "vue";

import {
  Node,
  Organization,
  QuorumSet,
} from "@stellarbeat/js-stellarbeat-shared";
import AddValidatorsTable from "@/components/node/tools/simulation/add-validators-table.vue";
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
  BIconThreeDotsVertical,
  BIconXCircle,
  BModal,
  VBModal,
} from "bootstrap-vue";
import StellarCoreConfigurationGenerator from "@stellarbeat/js-stellarbeat-shared/lib/stellar-core-configuration-generator";
import AddOrganizationsTable from "@/components/node/tools/simulation/add-organizations-table.vue";
import useStore from "@/store/useStore";

Vue.directive("b-modal", VBModal);

export interface Props {
  quorumSet: QuorumSet;
  parentQuorumSet: QuorumSet | null | undefined;
  level: number | undefined;
}
const props = withDefaults(defineProps<Props>(), {
  level: 0,
  parentQuorumSet: null,
});
const { quorumSet, parentQuorumSet, level } = toRefs(props);
const emit = defineEmits(["expand"]);

const editingThreshold = ref(false);
const newThreshold = ref(quorumSet.value.threshold);
const id = ref(Math.ceil(Math.random() * 1000));
const validatorsToAdd = ref<string[]>([]);
const organizationsToAdd = ref<Organization[]>([]);
const inputState = ref<boolean | null>(null);
const tomlNodesExport = ref("");

const store = useStore();
const network = store.network;

const dropdown = ref<BDropdown | null>(null);

function deleteQuorumSet() {
  if (!parentQuorumSet.value) return;
  store.deleteInnerQuorumSet(quorumSet.value, parentQuorumSet.value);
}

const possibleOrganizationsToAdd = computed(() => {
  const trustedOrganizations = network
    .getTrustedOrganizations(quorumSet.value)
    .map((org) => org.id);

  return store.network.organizations.filter(
    (organization) => trustedOrganizations.indexOf(organization.id) < 0,
  );
});

const possibleValidatorsToAdd = computed(() => {
  return network.nodes.filter(
    (node: Node) =>
      node.isValidator &&
      QuorumSet.getAllValidators(quorumSet.value).indexOf(node.publicKey) < 0,
  );
});

function addValidatorsToQuorumSet(
  toQuorumSet: QuorumSet,
  validators: string[],
) {
  store.addValidators(toQuorumSet, validators);
}

function addOrganizationsToQuorumSet(
  toQuorumSet: QuorumSet,
  organizations: Organization[],
) {
  store.addOrganizations(toQuorumSet, organizations);
}

function addQuorumSet() {
  store.addInnerQuorumSet(quorumSet.value);
  emit("expand");
}

function saveThresholdFromInput() {
  if (newThreshold.value <= 0) {
    inputState.value = false;
    return;
  }

  inputState.value = null;
  editingThreshold.value = false;
  if (dropdown.value) dropdown.value.hide(true);
  store.editQuorumSetThreshold(quorumSet.value, Number(newThreshold.value));
}

function onValidatorsSelected(validators: Node[]) {
  validatorsToAdd.value = validators.map(
    (validator: Node) => validator.publicKey,
  );
}

function onOrganizationsSelected(organizations: Organization[]) {
  organizationsToAdd.value = organizations;
}

function validatorsToAddModalOk() {
  if (validatorsToAdd.value.length > 0) {
    addValidatorsToQuorumSet(quorumSet.value, validatorsToAdd.value);
    emit("expand");
  }
}

function organizationsToAddModalOk() {
  if (organizationsToAdd.value.length > 0) {
    addOrganizationsToQuorumSet(quorumSet.value, organizationsToAdd.value);
  }
}

function loadTomlExport() {
  const stellarCoreConfigurationGenerator =
    new StellarCoreConfigurationGenerator(network);
  tomlNodesExport.value = stellarCoreConfigurationGenerator.quorumSetToToml(
    quorumSet.value,
  );
}
</script>

<style scoped>
.thresholdEdit {
  margin-left: 10px;
  width: 45px !important;
}
</style>
