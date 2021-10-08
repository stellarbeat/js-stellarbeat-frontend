<template>
  <div class="dropdown search">
    <b-form-input
      class="form-control search-input"
      type="text"
      v-model.lazy="searchString"
      ref="searchInput"
      id="searchInput"
      placeholder="Search"
      autocomplete="off"
      @keydown.tab.native.prevent.stop="onArrowDown"
      @keydown.down.native="onArrowDown"
      @keydown.up.native="onArrowUp"
      @keydown.enter.native.prevent.stop="onEnter"
      @keydown.esc.native="searchString = ''"
    >
    </b-form-input>
    <div
      class="dropdown-menu sb-dropdown-menu"
      v-bind:class="{ show: showSuggestions }"
      aria-labelledby="searchInput"
      role="button"
      tabindex="0"
    >
      <a
        class="dropdown-item"
        href="#"
        v-for="(match, i) in filteredList"
        :key="i"
        @click.prevent.stop="navigate(match)"
        :class="{ active: i === arrowCounter }"
      >
        <div class="w-100">
          <h5 class="mb-1 mr-2 name">{{ match.name }}</h5>
        </div>
        <small>{{ match.type }}</small>
      </a>
    </div>

    <div class="input-icon-addon">
      <b-icon-search />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";

import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import { RawLocation } from "vue-router";
import { BIconSearch, BFormInput } from "bootstrap-vue";

type Match = { name: string; type: string; route: RawLocation };
@Component({
  name: "search",
  components: { BIconSearch, BFormInput },
})
export default class Search extends Vue {
  protected searchString = "";
  protected arrowCounter = -1;

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  get showSuggestions() {
    if (this.searchString === "") {
      return false;
    }

    return this.filteredList.length !== 0;
  }

  get filteredList(): Match[] {
    let match = (text: string) =>
      text.toLowerCase().includes(this.searchString.toLowerCase().trim());

    let matchedOrganizations = this.network.organizations
      .filter((organization) => {
        return match(organization.name);
      })
      .map((organization) => {
        return {
          name: organization.name,
          type: "organization",
          route: {
            name: "organization-dashboard",
            params: { organizationId: organization.id },
            query: {
              center: "1",
              "no-scroll": "1",
              view: this.$route.query.view,
              network: this.$route.query.network,
            },
          } as RawLocation,
        };
      });

    let matchedNodes = this.network.nodes
      .filter((node) => {
        return (
          match(node.displayName) || match(node.publicKey!) || match(node.key)
        );
      })
      .map((node) => {
        return {
          name: node.displayName,
          type: node.isValidator ? "validator node" : "watcher node",
          route: {
            name: "node-dashboard",
            params: { publicKey: node.publicKey! },
            query: {
              center: "1",
              "no-scroll": "1",
              view: this.$route.query.view,
              network: this.$route.query.network,
            },
          } as RawLocation,
        };
      });

    return matchedOrganizations.concat(matchedNodes).slice(0, 10);
  }

  protected navigate(match: Match) {
    this.searchString = "";
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.$router.push(match.route).catch(() => {});
  }

  protected onArrowDown() {
    if (this.arrowCounter < this.filteredList.length - 1) {
      this.arrowCounter = this.arrowCounter + 1;
    } else this.arrowCounter = 0;
  }

  protected onArrowUp() {
    if (this.arrowCounter > 0) {
      this.arrowCounter = this.arrowCounter - 1;
    } else this.arrowCounter = this.filteredList.length - 1;
  }

  protected onEnter() {
    if (this.arrowCounter !== -1) {
      this.navigate(this.filteredList[this.arrowCounter]);
    }

    this.arrowCounter = -1;

    (this.$refs.searchInput as any).blur();
  }
}
</script>

<style scoped>
.search {
  width: 100%;
}

.dropdown-menu {
  width: 100%;
  z-index: 10000;
  margin-top: 0 !important;
}
.name {
  white-space: normal;
}
</style>
