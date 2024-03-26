<template>
  <div class="d-none d-lg-flex">
    <div class="d-flex">
      <div class="nav-item pr-0" style="cursor: default">
        <div
          v-if="store.networkContexts.size > 1 && !store.isLoading"
          style="width: 137px"
          class="dropdown"
        >
          <button
            id="networkDropDown"
            class="btn btn-link dropdown-toggle p-0 m-0 align-baseline"
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {{ store.getNetworkContextName() }}
          </button>
          <div class="dropdown-menu" aria-labelledby="networkDropDown">
            <a
              v-for="network in Array.from(store.networkContexts.keys())"
              :key="network"
              class="dropdown-item"
              @click="navigateToNetwork(network)"
            >
              {{ store.getNetworkContextName(network) }}
            </a>
          </div>
        </div>
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
          Github
        </a>
        <a
          :href="`mailto:${store.appConfig.brandEmail}`"
          class="btn btn-sm btn-outline-primary ml-2"
          target="_blank"
        >
          Mail
        </a>
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
