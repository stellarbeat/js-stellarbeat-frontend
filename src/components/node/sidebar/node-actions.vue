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
      v-on:click.prevent.stop="store.toggleValidating(node)"
    >
      <b-icon-lightning scale="0.9" />
      {{ node.isValidating ? "Halt this node" : "Start validating" }}
    </b-dropdown-item>
    <b-dropdown-text v-else>
      Node blocked: quorumset not reaching threshold
    </b-dropdown-text>
    <b-dropdown-item
      v-if="supportsDelete"
      v-on:click="store.deleteValidatorFromQuorumSet(quorumSet, node)"
      @click.prevent.stop
    >
      <b-icon-x-circle scale="0.9" />
      Remove
    </b-dropdown-item>
    <b-dropdown-header> Tools </b-dropdown-header>
    <b-dropdown-item
      v-if="supportsHaltingAnalysis"
      v-on:click.prevent.stop="store.showHaltingAnalysis(node)"
    >
      <b-icon-gear-wide scale="0.9" />
      Halting analysis
    </b-dropdown-item>
    <b-dropdown-item-button v-on:click.prevent.stop="copyPublicKey">
      <b-icon-clipboard scale="0.9" />
      Copy public key
    </b-dropdown-item-button>
  </b-dropdown>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import {
  BDropdown,
  BDropdownItem,
  BIconThreeDotsVertical,
  BDropdownText,
  BDropdownHeader,
  BIconXCircle,
  BIconGearWide,
  BIconClipboard,
  BIconLightning,
  BDropdownItemButton,
} from "bootstrap-vue";

import { Network, Node, QuorumSet } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";

@Component({
  components: {
    BDropdown,
    BDropdownItem,
    BDropdownText,
    BIconThreeDotsVertical,
    BDropdownHeader,
    BIconXCircle,
    BIconGearWide,
    BIconClipboard,
    BIconLightning,
    BDropdownItemButton,
  },
})
export default class NodeActions extends Vue {
  @Prop()
  public node!: Node;
  @Prop({ default: false })
  public supportsDelete!: boolean;
  @Prop()
  public quorumSet!: QuorumSet;
  @Prop({ default: true })
  public supportsHaltingAnalysis!: boolean;

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  copyPublicKey() {
    this.$copyText(this.node.publicKey!);
  }
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
