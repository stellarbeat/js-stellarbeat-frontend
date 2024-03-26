<template>
  <div class="d-none d-lg-flex">
    <div class="d-flex">
      <div class="nav-item pr-0" style="cursor: default">
        <b-nav-item-dropdown
          v-if="store.networkContexts.size > 1 && !store.isLoading"
          style="width: 137px"
          toggle-class="text-default"
          class="text-default nav-link px-0"
        >
          <template #button-content>
            {{ store.getNetworkContextName() }}
          </template>
          <b-dropdown-item
            v-for="network in Array.from(store.networkContexts.keys())"
            :key="network"
            @click="navigateToNetwork(network)"
          >
            {{ store.getNetworkContextName(network) }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <div v-else class="text-gray" style="width: 137px">
          {{ store.getNetworkContextName() }}
        </div>
        <a
          href="https://github.com/stellarbeat"
          class="btn btn-sm btn-outline-primary"
          target="_blank"
          rel="noopener"
        >
          <github />
          Github</a
        >
        <a
          :href="`mailto:${store.appConfig.brandEmail}`"
          class="btn btn-sm btn-outline-primary ml-2"
          target="_blank"
        >
          <b-icon-envelope />
          Mail</a
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Github from "@/components/organization/logo/github.vue";
import useStore from "@/store/useStore";
import { useRouter } from "vue-router/composables";

const store = useStore();
const router = useRouter();

const navigateToNetwork = (networkId: string) => {
  if (networkId === store.networkContext.networkId) return;
  router
    .push({
      name: "network-dashboard",
      query: { network: networkId },
    })
    .catch(() => {
      //this triggers a navigation guard error that we can safely ignore. See router beforeEach
    });
};
</script>
