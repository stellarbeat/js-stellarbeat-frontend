<template>
  <div>
    <div class="page-header d-flex justify-content-between">
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

<script lang="ts">
import Vue from "vue";
import Search from "../components/search.vue";
import NetworkStatistics from "../components/network/cards/network-statistics/network-statistics.vue";
import HaltingAnalysis from "@/components/node/tools/halting-analysis/halting-analysis.vue";
import { Network } from "@stellarbeat/js-stellar-domain";
import { Component, Prop, Watch } from "vue-property-decorator";
import Store from "@/store/Store";
import NetworkVisualNavigator from "@/components/visual-navigator/network-visual-navigator.vue";
import NetworkSideBar from "@/components/network/sidebar/network-side-bar.vue";
import CrawlTime from "@/components/crawl-time.vue";
import SimulationBadge from "@/components/simulation-badge.vue";
import TimeTravelBadge from "@/components/time-travel-badge.vue";
import { BBreadcrumb, BAlert } from "bootstrap-vue";
import LazyHydrate from "vue-lazy-hydration";
import { Route } from "vue-router";
import useStore from "@/store/useStore";

@Component({
  name: "dashboard",
  components: {
    BAlert,
    LazyHydrate,
    "network-analysis": () =>
      import(
        "@/components/network/tools/network-analysis/network-analysis.vue"
      ),
    TimeTravelBadge,
    SimulationBadge,
    CrawlTime,
    NetworkSideBar,
    NetworkVisualNavigator,
    Search,
    Statistics: NetworkStatistics,
    HaltingAnalysis,
    BBreadcrumb: BBreadcrumb,
  },
})
export default class Dashboard extends Vue {
  @Prop({ default: "graph" })
  public view!: string;

  @Watch("$route", { immediate: true })
  public onRouteChanged(to: Route) {
    if (to.params.publicKey) {
      this.store.selectedNode = this.network.getNodeByPublicKey(
        to.params.publicKey
      );
      if (!this.store.selectedNode) {
        this.$router.push({
          name: "network-dashboard",
          query: {
            view: this.$route.query.view,
            network: this.$route.query.network,
            at: this.$route.query.at,
          },
        });
      }
    } else this.store.selectedNode = undefined;
    if (to.params.organizationId) {
      this.store.selectedOrganization = this.network.getOrganizationById(
        to.params.organizationId
      );
      if (!this.store.selectedOrganization) {
        this.$router.push({
          name: "network-dashboard",
          query: {
            view: this.$route.query.view,
            network: this.$route.query.network,
            at: this.$route.query.at,
          },
        });
      }
    } else this.store.selectedOrganization = undefined;

    if (to.query.center === "1" || !to.query.center) {
      this.store.centerNode = this.store.selectedNode;
    }
  }

  @Watch("store.haltingAnalysisPublicKey")
  public onHaltingAnalysisPublicKeyChanged(publicKey?: string) {
    if (publicKey)
      this.$nextTick(() => {
        this.$scrollTo("#halting-analysis-card");
      });
  }

  get breadCrumbs() {
    let crumbs = [];
    crumbs.push({
      text: this.store.getNetworkContextName(),
      to: {
        name: "network-dashboard",
        query: {
          view: this.$route.query.view,
          network: this.$route.query.network,
        },
      },
    });

    if (this.selectedNode) {
      if (this.selectedNode.organizationId)
        crumbs.push({
          text: this.network.getOrganizationById(
            this.selectedNode.organizationId
          ).name,
          to: {
            name: "organization-dashboard",
            params: {
              organizationId: this.selectedNode.organizationId,
            },
          },
          active: false,
        });
      crumbs.push({
        text: this.selectedNode.displayName,
        active: true,
      });
    } else if (this.selectedOrganization)
      crumbs.push({
        text: this.selectedOrganization.name,
        active: true,
      });
    return crumbs;
  }

  get store(): Store {
    return useStore();
  }

  get selectedNode() {
    return this.store.selectedNode;
  }

  get selectedOrganization() {
    return this.store.selectedOrganization;
  }

  get network(): Network {
    return useStore().network;
  }

  get isSimulation(): boolean {
    return this.store.isSimulation;
  }
}
</script>

<style scoped>
@media (min-width: 1279px) {
  .side-bar {
    width: 272px;
  }
}
</style>
