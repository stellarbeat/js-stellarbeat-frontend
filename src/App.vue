<template>
  <div id="app" class="page full">
    <div class="flex-fill">
      <div>
        <b-navbar toggle-breakpoint="lg" class="m-0 p-0" toggleable="lg">
          <div class="header pt-2 pb-0 my-header">
            <div class="container-fluid" style="max-width: 1360px">
              <div class="d-flex justify-content-between w-100">
                <div class="d-flex">
                  <router-link
                    class="header-brand mr-0 mt-2"
                    :to="{ name: 'network-dashboard' }"
                  >
                    <img
                      src="./assets/logo.svg"
                      width="27.833"
                      height="32"
                      class="header-brand-img"
                      alt="stellarbeat.io"
                    />
                  </router-link>
                  <div class="d-none d-lg-flex" style="width: 264px"></div>
                </div>
                <div class="d-flex flex-column mr-0">
                  <h2 class="brand-title mb-0">stellarbeat.io</h2>
                  <h6 class="text-muted">stellar network visibility</h6>
                </div>
                <div class="d-none d-lg-flex">
                  <div class="d-flex">
                    <div class="nav-item pr-0">
                      <b-nav-item-dropdown
                        style="width: 137px"
                        toggle-class="gray"
                        class="text-gray nav-link px-0"
                        v-if="!store.isLoading"
                      >
                        <template #button-content>
                          {{ store.getNetworkIdPretty() }}
                        </template>
                        <b-dropdown-item
                          v-for="network in Array.from(store.availableNetworks)"
                          :key="network"
                          @click="navigateToNetwork(network)"
                        >
                          {{ store.getNetworkIdPretty(network) }}
                        </b-dropdown-item>
                      </b-nav-item-dropdown>
                      <div v-else style="width: 137px"></div>
                      <a
                        href="https://github.com/stellarbeat"
                        class="btn btn-sm bt btn-primary-sb"
                        target="_blank"
                        rel="noopener"
                      >
                        <github />
                        Github</a
                      >
                      <a
                        href="mailto:info@stellarbeat.io"
                        class="btn btn-sm bt btn-primary-sb ml-2"
                        target="_blank"
                      >
                        <b-icon-envelope />
                        Mail</a
                      >
                    </div>
                  </div>
                </div>
                <b-navbar-toggle
                  class="my-navbar-toggle"
                  target="nav_collapse"
                ></b-navbar-toggle>
              </div>
            </div>
          </div>
        </b-navbar>
        <b-collapse
          class="header collapse d-lg-flex p-0"
          is-nav
          id="nav_collapse"
        >
          <div class="container-fluid collapser" style="max-width: 1360px">
            <div class="row align-items-center">
              <b-nav-item-dropdown
                variant="primary"
                toggle-class="gray"
                class="ml-0 pl-0 mt-3 d-lg-none"
                v-if="!store.isLoading"
              >
                <template #button-content>
                  {{ store.getNetworkIdPretty() }}
                </template>
                <b-dropdown-item
                  v-for="network in Array.from(store.availableNetworks)"
                  :key="network"
                  @click="navigateToNetwork(network)"
                >
                  {{ store.getNetworkIdPretty(network) }}
                </b-dropdown-item>
              </b-nav-item-dropdown>
              <div class="col-lg order-lg-first">
                <ul class="nav nav-tabs border-0 flex-column flex-lg-row">
                  <li class="nav-item">
                    <router-link
                      active-class="active"
                      exact-active-class="active"
                      class="nav-link"
                      exact
                      :to="{
                        name: 'network-dashboard',
                        query: {
                          view: $route.query.view,
                          network: $route.query.network,
                          at: $route.query.at,
                        },
                      }"
                      :class="homeActiveClass"
                    >
                      <b-icon-house class="mr-1" scale="0.9" />
                      Home
                    </router-link>
                  </li>
                  <li class="nav-item">
                    <router-link
                      active-class="active"
                      exact-active-class="active"
                      class="nav-link"
                      :to="{
                        name: 'nodes',
                        query: {
                          view: $route.query.view,
                          network: $route.query.network,
                          at: $route.query.at,
                        },
                      }"
                      exact
                    >
                      <b-icon-bullseye class="mr-1" scale="0.9" />
                      Nodes
                    </router-link>
                  </li>
                  <li class="nav-item">
                    <router-link
                      active-class="active"
                      class="nav-link"
                      :to="{
                        name: 'organizations',
                        query: {
                          view: $route.query.view,
                          network: $route.query.network,
                          at: $route.query.at,
                        },
                      }"
                      exact
                    >
                      <b-icon-building class="mr-1" scale="0.9" />
                      Organizations
                    </router-link>
                  </li>
                  <!--li
                    class="nav-item"
                    v-if="
                      !store.isLoading &&
                      !store.fetchingDataFailed &&
                      store.networkId === 'public' &&
                      !store.isSimulation
                    "
                  >
                    <router-link
                      active-class="active"
                      class="nav-link"
                      :to="{
                        name: 'subscribe',
                        query: {
                          view: $route.query.view,
                          network: $route.query.network,
                          at: $route.query.at,
                        },
                      }"
                      exact
                    >
                      <b-icon-bell class="mr-1" scale="0.9" />
                      Notify
                    </router-link>
                  </li!-->
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      target="_blank"
                      href="https://medium.com/stellarbeatio"
                      rel="noopener"
                    >
                      <b-icon-newspaper class="mr-1" scale="0.9" />
                      Blog
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      target="_blank"
                      href="https://api.stellarbeat.io/docs"
                      rel="noopener"
                    >
                      <b-icon-code class="mr-1" scale="0.9" />
                      API
                    </a>
                  </li>
                  <li class="nav-item">
                    <router-link
                      active-class="active"
                      class="nav-link"
                      :to="{
                        name: 'faq',
                        query: {
                          view: $route.query.view,
                          network: $route.query.network,
                          at: $route.query.at,
                        },
                      }"
                    >
                      <b-icon-question-circle class="mr-1" scale="0.9" />
                      FAQ
                    </router-link>
                  </li>
                </ul>
              </div>
              <div class="col-lg-3 ml-auto">
                <form class="input-icon my-3 my-lg-0">
                  <search
                    v-if="!store.isLoading && !store.fetchingDataFailed"
                  />
                </form>
              </div>
            </div>
          </div>
        </b-collapse>
      </div>

      <div class="container-fluid h-100 mt-0 mt-md-2" style="max-width: 1360px">
        <b-alert :show="showError" variant="danger">{{ errorMessage }}</b-alert>
        <b-alert :show="store.isLocalNetwork" variant="info"
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
              class="btn btn-sm bt btn-primary-sb"
              target="_blank"
              rel="noopener"
            >
              <github />
              Github</a
            >
            <a
              href="mailto:info@stellarbeat.io"
              rel="noopener"
              class="btn btn-sm bt btn-primary-sb ml-2"
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

<script lang="ts">
import Vue from "vue";
import { Component, Watch } from "vue-property-decorator";
import Search from "@/components/search.vue";
import UndoRedo from "@/components/node/tools/simulation/UndoRedo.vue";
import Github from "@/components/organization/logo/github.vue";
import CustomNetwork from "@/components/network/tools/modify-network.vue";
import {
  BNavbar,
  BAlert,
  BCollapse,
  BIconBuilding,
  BIconBullseye,
  BIconHouse,
  BIconCode,
  BIconQuestionCircle,
  BIconEnvelope,
  BNavbarToggle,
  BFormSelect,
  BIconGlobe2,
  BNavItemDropdown,
  BDropdownItem,
  BIconNewspaper,
  BBadge,
  BIconBell,
} from "bootstrap-vue";
import Store from "@/store/Store";
import { Route } from "vue-router";
import { isString } from "@stellarbeat/js-stellar-domain/lib/typeguards";

@Component({
  name: "app",
  components: {
    BIconBell,
    Github,
    CustomNetwork,
    UndoRedo,
    Search,
    BNavbar,
    BNavItemDropdown,
    BDropdownItem,
    BAlert,
    BCollapse,
    BIconBuilding,
    BIconBullseye,
    BIconHouse,
    BIconCode,
    BIconQuestionCircle,
    BIconEnvelope,
    BNavbarToggle,
    BFormSelect,
    BIconGlobe2,
    BIconNewspaper,
    BBadge,
  },
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
})
export default class App extends Vue {
  protected errorMessage =
    "Could not connect to stellarbeat.io api, please refresh the page";
  protected navCollapsed = false;

  async created() {
    let networkId = this.$route.query.network;
    if (
      "string" === typeof networkId &&
      this.store.availableNetworks.includes(networkId)
    ) {
      this.store.networkId = networkId;
    }
    let timeAt = this.store.getDateFromParam(this.$route.query.at);
    await this.store.initializeNetwork(timeAt);
  }

  serverPrefetch() {
    let networkId = this.$route.query.network;
    if (
      "string" === typeof networkId &&
      this.store.availableNetworks.includes(networkId)
    ) {
      this.store.networkId = networkId;
    }
    let timeAt = this.store.getDateFromParam(this.$route.query.at);

    return this.store.initializeNetwork(timeAt);
  }

  @Watch("$route", { immediate: false })
  async onRouteChanged(to: Route) {
    let networkId = this.store.networkId;
    let timeTravelDate = this.store.getDateFromParam(to.query.at);
    let timeTravel = false;
    if (!timeTravelDate && this.store.isTimeTravel)
      //time travel reset
      timeTravel = true;
    if (timeTravelDate && !this.store.timeTravelDate) timeTravel = true;
    if (
      timeTravelDate &&
      this.store.timeTravelDate &&
      timeTravelDate.getTime() !== this.store.timeTravelDate.getTime()
    )
      timeTravel = true;

    if (
      isString(to.query.network) &&
      this.store.availableNetworks.includes(to.query.network)
    )
      networkId = to.query.network;

    if (networkId !== this.store.networkId || timeTravel) {
      this.store.networkId = networkId;
      this.store.isLoading = true;
      await this.$nextTick(async () => {
        //next tick is needed to toggle the loading state. The loading state is needed to clean up the previous gui.
        await this.store.initializeNetwork(
          timeTravel ? timeTravelDate : undefined
        );
      });
    }
  }

  get store(): Store {
    return this.$root.$data.store;
  }

  get network() {
    return this.store.network;
  }

  get showError() {
    return this.store.fetchingDataFailed;
  }

  get homeActiveClass() {
    return {
      active:
        this.$route.name === "network-dashboard" ||
        this.$route.name === "node-dashboard" ||
        this.$route.name === "organization-dashboard",
    };
  }

  navigateToNetwork(networkId: string) {
    if (networkId === this.store.networkId) return;

    this.$router
      .push({
        name: "network-dashboard",
        query: { network: networkId },
      })
      .catch(() => {
        //this triggers a navigation guard error that we can safely ignore. See router beforeEach
      });
  }
}
</script>

<style scoped>
.action-bar {
  background-color: #eaebed;
  padding: 2px;
}

.full {
  background: #f5f7fb;
}

.brand-title {
  color: #44bbe7;
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
