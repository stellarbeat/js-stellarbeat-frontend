<template>
  <div id="public-horizon-apis-card" class="card">
    <div class="card-header pl-3">
      <h1 class="card-title">Public Horizon API's</h1>
    </div>
    <div class="card-body p-0">
      <b-list-group flush class="w-100 mb-4 card-columns">
        <b-list-group-item
          v-for="horizon in horizons"
          :key="horizon.name"
          class="px-3 py-3"
        >
          <a :href="horizon.url" target="_blank" rel="noopener">{{
            horizon.name
          }}</a>
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { BListGroup, BListGroupItem } from "bootstrap-vue";
import useStore from "@/store/useStore";

const store = useStore();
const network = store.network;

const horizons = computed(() => {
  return network.organizations
    .filter((organization) => organization.horizonUrl)
    .map((organization) => {
      return {
        name: organization.name,
        url: organization.horizonUrl,
      };
    });
});
</script>
