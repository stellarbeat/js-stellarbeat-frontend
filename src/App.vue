<template>
  <div id="app" class="page full">
    <div class="flex-fill">
      <navbar
        :brand-tagline="store.appConfig.brandTagline"
        :brand-name="store.appConfig.brandName"
        :enable-brand-image="store.appConfig.enableBrandImg"
        :brand-image="{
          alt: store.appConfig.brandImgAlt,
          src: store.appConfig.brandImgSrc,
        }"
        :api-doc-url="store.appConfig.apiDocUrl"
        :blog-url="store.appConfig.blogUrl"
        :include-notify="store.networkContext.enableNotify"
      ></navbar>
      <div class="container-fluid h-100 mt-0 mt-md-2" style="max-width: 1360px">
        <b-alert :show="showError" variant="danger">{{ errorMessage }}</b-alert>
        <b-alert
          :show="['fbas', 'fbas2'].includes(store.networkContext.networkId)"
          variant="info"
          >Learn more about the demo networks
          <a
            href="https://medium.com/stellarbeatio/stellar-fbas-intuition-5b8018f58f3e"
            target="_blank"
            rel="noopener"
            >here!</a
          ></b-alert
        >
        <div v-if="store.isLoading" class="d-flex justify-content-center mt-5">
          <div class="loader"></div>
        </div>
        <div v-else>
          <router-view
            v-if="!store.isLoading && !store.fetchingDataFailed"
            :isLoading="store.isLoading"
          />
          <custom-network></custom-network>
        </div>
      </div>
    </div>
    <footer class="footer">
      <div class="container-fluid" style="max-width: 1360px">
        <div class="d-flex justify-content-between mx-4">
          <router-link
            active-class="active"
            class="nav-link"
            :to="{
              name: 'terms-and-conditions',
              query: {
                view: $route.query.view,
                network: $route.query.network,
                at: $route.query.at,
              },
            }"
            exact
          >
            Terms and Conditions
          </router-link>
          <div class="nav-item d-none d-lg-flex pr-0">
            <a
              href="https://github.com/stellarbeat"
              class="btn btn-sm bt btn-primary"
              target="_blank"
              rel="noopener"
            >
              <github />
              Github</a
            >
            <a
              href="mailto:info@stellarbeat.io"
              rel="noopener"
              class="btn btn-sm bt btn-primary ml-2"
              target="_blank"
            >
              <b-icon-envelope />
              Mail</a
            >
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/components/layout/Navbar.vue";
import Github from "@/components/organization/logo/github.vue";
import CustomNetwork from "@/components/network/tools/modify-network.vue";
import { BAlert, BIconEnvelope } from "bootstrap-vue";
import { isString } from "@stellarbeat/js-stellar-domain/lib/typeguards";
import useStore from "@/store/useStore";
import { computed, nextTick, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router/composables";

const errorMessage = ref(
  "Could not connect to stellarbeat.io api, please refresh the page"
);

const store = useStore();
const showError = store.fetchingDataFailed;
const route = useRoute();

const getNetworkIdFromQueryParam = (
  networkQueryParameter: string | (string | null)[]
): string | null => {
  if (isString(networkQueryParameter)) return networkQueryParameter;
  return null;
};

const networkId = computed(() => {
  return getNetworkIdFromQueryParam(route.query.network);
});

const timeTravelDate = computed(() => {
  return store.getDateFromParam(route.query.at);
});

onBeforeMount(async () => {
  await store.updateNetwork(networkId.value, timeTravelDate.value);
});

watch(
  [networkId, timeTravelDate],
  async () => {
    if (!store.networkNeedsToBeUpdated(networkId.value, timeTravelDate.value))
      return;

    store.isLoading = true;
    nextTick(async () => {
      //next tick is needed to toggle the loading state. The loading state is needed to clean up the previous gui.
      await store.updateNetwork(networkId.value, timeTravelDate.value);
    });
  },
  { immediate: false, deep: true }
);
</script>

<script lang="ts">
export default {
  metaInfo: {
    title: "Stellarbeat.io - Stellar network visibility",
    meta: [
      {
        name: "description",
        content:
          "Giving insight into the Stellar network through various tools & visualizations.",
      },
    ],
  },
};
</script>

<style scoped>
.action-bar {
  background-color: #eaebed;
  padding: 2px;
}

.full {
  background: #f5f7fb;
}

.collapser {
  background: white;
}

.my-header {
  width: 100%;
}

.my-navbar-toggle {
  border: none;
}
</style>

<style>
.gray {
  color: #80858a !important;
}
</style>
