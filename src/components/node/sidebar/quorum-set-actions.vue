<template>
  <div>
    <b-dropdown
      ref="dropdown"
      boundary="viewport"
      right
      text="More"
      class="p-0 m-0"
      toggle-class="more-button btn-thin"
      no-caret
      @click.prevent.stop=""
    >
      <template slot="button-content">
        <b-icon-three-dots-vertical scale="0.9" />
      </template>
      <b-dropdown-header id="dropdown-header-label" @click.prevent.stop="">
        Simulation options
      </b-dropdown-header>
      <b-dropdown-item
        v-if="level === 0"
        @click.prevent.stop="showAddOrganizationsModal(id)"
      >
        <b-icon-plus-circle class="dropdown-icon" scale="0.9" />
        Add organization
      </b-dropdown-item>
      <b-dropdown-item @click.prevent.stop="showAddValidatorsModal(id)">
        <b-icon-plus-circle class="dropdown-icon" scale="0.9" />
        Add Validators
      </b-dropdown-item>
      <b-dropdown-item v-if="!(level === 2)" @click.prevent.stop="addQuorumSet">
        <b-icon-plus-circle class="dropdown-icon" scale="0.9" />
        Add QuorumSet
      </b-dropdown-item>
      <b-dropdown-item
        v-if="!(level === 0)"
        @click.prevent.stop="deleteQuorumSet"
      >
        <b-icon-x-circle class="dropdown-icon" scale="0.9" />
        Delete QuorumSet
      </b-dropdown-item>
      <b-dropdown-form inline @click.prevent.stop="">
        <div class="d-flex align-items-center">
          <b-icon-pencil class="dropdown-icon" scale="0.9" />
          <b-form-group
            label-size="sm"
            label="Threshold"
            label-for="dropdown-edit-threshold"
            @submit.stop.prevent
            @click.prevent.stop
          >
            <b-form-input
              v-model="newThreshold"
              :state="inputState"
              class="thresholdEdit"
              size="sm"
              type="number"
            >
            </b-form-input>
          </b-form-group>
        </div>
        <b-button
          variant="primary"
          size="sm"
          class="mt-2"
          @click="saveThresholdFromInput"
          >Save Threshold
        </b-button>
      </b-dropdown-form>
      <b-dropdown-divider />
      <b-dropdown-item @click.prevent.stop="showTomlExportModal(id)">
        <b-icon-download class="dropdown-icon" scale="0.9" />
        Stellar core config
      </b-dropdown-item>
    </b-dropdown>
    <QuorumSetTomlExportModal :id="id" :quorum-set="quorumSet" />
    <QuorumSetAddOrganizationsModal :id="id" :quorum-set="quorumSet" />
    <QuorumSetAddValidatorsModal :id="id" :quorum-set="quorumSet" />
  </div>
</template>

<script setup lang="ts">
import Vue, { ref, toRefs } from "vue";

import { QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
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
  VBModal,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import QuorumSetTomlExportModal from "@/components/node/sidebar/quorum-set-toml-export-modal.vue";
import QuorumSetAddOrganizationsModal from "@/components/node/sidebar/quorum-set-add-organizations-modal.vue";
import QuorumSetAddValidatorsModal from "@/components/node/sidebar/quorum-set-add-validators-modal.vue";

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
const inputState = ref<boolean | null>(null);

const store = useStore();

const dropdown = ref<BDropdown | null>(null);

function deleteQuorumSet() {
  if (!parentQuorumSet.value) return;
  store.deleteInnerQuorumSet(quorumSet.value, parentQuorumSet.value);
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

function showTomlExportModal(id: number) {
  $("#quorumSetTomlExportModal" + id).modal("show");
}

function showAddValidatorsModal(id: number) {
  $("#add-validator-modal-" + id).modal("show");
}
function showAddOrganizationsModal(id: number) {
  $("#add-organization-modal-" + id).modal("show");
}
</script>

<style scoped>
.thresholdEdit {
  margin-left: 10px;
  width: 45px !important;
}
</style>
