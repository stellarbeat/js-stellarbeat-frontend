<template>
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
    <b-dropdown-item
      v-if="!network.isValidatorBlocked(node)"
      @click.prevent.stop="store.toggleValidating(node)"
    >
      <b-icon-lightning scale="0.9" />
      {{ node.isValidating ? "Halt this node" : "Start validating" }}
    </b-dropdown-item>
    <b-dropdown-text v-else>
      Node blocked: quorumset not reaching threshold
    </b-dropdown-text>
    <b-dropdown-item
      v-if="supportsDelete"
      @click="deleteValidatorFromQuorumSet(node, quorumSet)"
      @click.prevent.stop
    >
      <b-icon-x-circle scale="0.9" />
      Remove
    </b-dropdown-item>
    <b-dropdown-header> Tools </b-dropdown-header>
    <b-dropdown-item
      v-if="supportsHaltingAnalysis"
      @click.prevent.stop="store.showHaltingAnalysis(node)"
    >
      <b-icon-gear-wide scale="0.9" />
      Halting analysis
    </b-dropdown-item>
    <b-dropdown-item-button @click.prevent.stop="copyPublicKey">
      <b-icon-clipboard scale="0.9" />
      Copy public key
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script setup lang="ts">
import {
  BDropdown,
  BDropdownHeader,
  BDropdownItem,
  BDropdownItemButton,
  BDropdownText,
  BIconClipboard,
  BIconGearWide,
  BIconLightning,
  BIconThreeDotsVertical,
  BIconXCircle,
} from "bootstrap-vue";

import { Node, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import useStore from "@/store/useStore";
import { toRefs } from "vue";

export interface Props {
  node: Node;
  supportsDelete?: boolean;
  quorumSet?: QuorumSet;
  supportsHaltingAnalysis?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  supportsDelete: false,
  supportsHaltingAnalysis: true,
  quorumSet: undefined,
});
const { node, supportsDelete, quorumSet, supportsHaltingAnalysis } =
  toRefs(props);

const store = useStore();
const network = store.network;

const deleteValidatorFromQuorumSet = (
  node: Node,
  quorumSet: QuorumSet | undefined,
) => {
  if (!quorumSet) return;
  store.deleteValidatorFromQuorumSet(quorumSet, node);
};

function copyPublicKey() {
  navigator.clipboard.writeText(node.value.publicKey);
}
</script>

<style scoped>
.btn-group-xs > .btn,
.btn-xs {
  padding: 0.25rem 0.25rem;
  font-size: 0.875rem;
  line-height: 0.5;
  border-radius: 0.2rem;
}

.btn-primary {
  background: #1997c6;
  border-color: #1997c6;
}

.btn-primary:hover {
  color: #fff;
  background-color: #1a85ad;
  border-color: #1a85ad;
}
.dropdown-header {
  padding: 0.5rem 1rem;
}
.hover-btn {
  position: absolute;
  right: 45px;
  border: none;
  outline: 0;
}
</style>
