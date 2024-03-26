<template>
  <div class="dropdown search">
    <input
      id="searchInput"
      ref="searchInput"
      v-model="searchString"
      class="form-control search-input"
      type="text"
      placeholder="Search"
      autocomplete="off"
      @keydown.tab.prevent.stop="onArrowDown"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent.stop="onEnter"
      @keydown.esc="searchString = ''"
    />
    <div
      class="dropdown-menu sb-dropdown-menu"
      :class="{ show: showSuggestions }"
      aria-labelledby="searchInput"
      role="button"
      tabindex="0"
    >
      <a
        v-for="(match, i) in filteredList"
        :key="i"
        class="dropdown-item"
        href="#"
        :class="{ active: i === arrowCounter }"
        @click.prevent.stop="navigate(match)"
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
  const match = (text: string) =>
    text.toLowerCase().includes(searchString.value.toLowerCase().trim());

  const matchedOrganizations = network.organizations
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

  const matchedNodes = network.nodes
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
