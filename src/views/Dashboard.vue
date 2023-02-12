<template>
  <div>
    <div class="page-header d-flex justify-content-between py-3">
      <div class="d-flex align-items-center">
        <h2 class="page-title">Network explorer</h2>
        <simulation-badge />
        <time-travel-badge />
        <div v-if="store.networkAnalyzer.analyzing">
          <div class="loader"></div>
        </div>
      </div>
      <crawl-time v-if="!store.isSimulation" />
    </div>
    <b-alert v-if="selectedNode" :show="selectedNode.unknown" variant="warning"
      >Selected node with public key:
      <strong>{{ selectedNode.publicKey }}</strong>
      is unknown or archived
    </b-alert>
    <b-alert
      v-if="selectedOrganization"
      :show="selectedOrganization.unknown"
      variant="warning"
      >Selected organization with id:
      <strong>{{ selectedOrganization.id }}</strong>
      is unknown or archived
    </b-alert>

    <div
      class="row row-cards row-deck"
      v-if="
        store.isHaltingAnalysisVisible &&
        !network.getNodeByPublicKey(store.haltingAnalysisPublicKey).unknown
      "
      id="halting-analysis-card"
    >
      <div class="col-12">
        <HaltingAnalysis :publicKey="store.haltingAnalysisPublicKey">
        </HaltingAnalysis>
      </div>
    </div>
    <div class="row h-100">
      <aside class="col-xs-12 col-sm-5 col-lg-3 col-xl-auto mb-5">
        <div class="card pt-0 sidebar-card h-100">
          <transition name="fade" mode="out-in">
            <router-view name="sideBar" class="h-100 side-bar" />
          </transition>
        </div>
      </aside>
      <div class="col-sm-7 col-lg-9 col-xl" id="content">
        <div class="row">
          <div class="col">
            <LazyHydrate when-visible>
              <network-visual-navigator :view="view" />
            </LazyHydrate>
          </div>
        </div>
        <div
          class="row"
          v-if="store.isNetworkAnalysisVisible"
          id="network-analysis-card"
        >
          <div class="col-12">
            <network-analysis></network-analysis>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <router-view name="dashboard" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, watch } from "vue";
import HaltingAnalysis from "@/components/node/tools/halting-analysis/halting-analysis.vue";
import NetworkVisualNavigator from "@/components/visual-navigator/network-visual-navigator.vue";
import CrawlTime from "@/components/crawl-time.vue";
import SimulationBadge from "@/components/simulation-badge.vue";
import TimeTravelBadge from "@/components/time-travel-badge.vue";
import { BAlert } from "bootstrap-vue";
import LazyHydrate from "vue-lazy-hydration";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";
import VueScrollTo from "vue-scrollto";

const NetworkAnalysis = defineAsyncComponent(
  () =>
    import("@/components/network/tools/network-analysis/network-analysis.vue")
);

defineProps({
  view: {
    type: String,
    required: true,
    default: "graph",
  },
});

const store = useStore();
const network = store.network;
const selectedNode = store.selectedNode;
const selectedOrganization = store.selectedOrganization;
const route = useRoute();
const router = useRouter();

watch(
  route,
  (to) => {
    if (to.params.publicKey) {
      store.selectedNode = network.getNodeByPublicKey(to.params.publicKey);
      if (!store.selectedNode) {
        router.push({
          name: "network-dashboard",
          query: {
            view: route.query.view,
            network: route.query.network,
            at: route.query.at,
          },
        });
      }
    } else store.selectedNode = undefined;
    if (to.params.organizationId) {
      store.selectedOrganization = network.getOrganizationById(
        to.params.organizationId
      );
      if (!store.selectedOrganization) {
        router.push({
          name: "network-dashboard",
          query: {
            view: route.query.view,
            network: route.query.network,
            at: route.query.at,
          },
        });
      }
    } else store.selectedOrganization = undefined;

    if (to.query.center === "1" || !to.query.center) {
      store.centerNode = store.selectedNode;
    }
  },
  { immediate: true }
);

const haltingAnalysisPublicKey = computed(() => {
  return store.haltingAnalysisPublicKey;
});

watch(haltingAnalysisPublicKey, (publicKey) => {
  if (publicKey)
    nextTick(() => {
      VueScrollTo.scrollTo("#halting-analysis-card");
    });
});
</script>

<style scoped>
@media (min-width: 1279px) {
  .side-bar {
    width: 272px;
  }
}
</style>
