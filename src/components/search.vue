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

<script setup lang="ts">
import { computed, ComputedRef, ref } from "vue";
import { RawLocation } from "vue-router";
import { BIconSearch, BFormInput } from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

type Match = { name: string; type: string; route: RawLocation };
const searchString = ref("");
const arrowCounter = ref(-1);

const store = useStore();
const router = useRouter();
const route = useRoute();
const network = store.network;

const showSuggestions = computed(() => {
  if (searchString.value === "") {
    return false;
  }

  return filteredList.value.length !== 0;
});

const filteredList: ComputedRef<Match[]> = computed(() => {
  let match = (text: string) =>
    text.toLowerCase().includes(searchString.value.toLowerCase().trim());

  let matchedOrganizations = network.organizations
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
            view: route.query.view,
            network: route.query.network,
          },
        } as RawLocation,
      };
    });

  let matchedNodes = network.nodes
    .filter((node) => {
      return (
        match(node.displayName) || match(node.publicKey) || match(node.key)
      );
    })
    .map((node) => {
      return {
        name: node.displayName,
        type: node.isValidator ? "validator node" : "watcher node",
        route: {
          name: "node-dashboard",
          params: { publicKey: node.publicKey },
          query: {
            center: "1",
            "no-scroll": "1",
            view: route.query.view,
            network: route.query.network,
          },
        } as RawLocation,
      };
    });

  return matchedOrganizations.concat(matchedNodes).slice(0, 10);
});

function navigate(match: Match) {
  searchString.value = "";
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  router.push(match.route).catch(() => {});
}

function onArrowDown() {
  if (arrowCounter.value < filteredList.value.length - 1) {
    arrowCounter.value = arrowCounter.value + 1;
  } else arrowCounter.value = 0;
}

function onArrowUp() {
  if (arrowCounter.value > 0) {
    arrowCounter.value = arrowCounter.value - 1;
  } else arrowCounter.value = filteredList.value.length - 1;
}

function onEnter() {
  if (arrowCounter.value !== -1) {
    navigate(filteredList.value[arrowCounter.value]);
  }

  arrowCounter.value = -1;
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
