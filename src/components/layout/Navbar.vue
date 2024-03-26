<template>
  <div>
    <nav
      toggle-breakpoint="lg"
      class="navbar navbar-expand-lg m-0 p-0"
      toggleable="lg"
    >
      <div class="header py-4 my-header">
        <div class="container-fluid" style="max-width: 1360px">
          <div class="d-flex justify-content-between w-100">
            <div class="d-flex">
              <router-link
                class="header-brand mr-0 mt-0"
                :to="{ name: 'network-dashboard' }"
              >
                <img
                  rel="preload"
                  src="@/assets/logo.svg"
                  class="header-brand-img mr-0"
                  width="400"
                  height="460"
                  :alt="brandLogo ? brandLogo.alt : undefined"
                />
              </router-link>
              <h2 class="brand-title mb-0">{{ brandName }}</h2>
            </div>
            <nav-network-selector />
            <b-navbar-toggle
              class="my-navbar-toggle"
              target="nav_collapse"
            ></b-navbar-toggle>
          </div>
        </div>
      </div>
    </nav>
    <b-collapse id="nav_collapse" class="header collapse d-lg-flex p-0" is-nav>
      <div class="container-fluid collapser" style="max-width: 1360px">
        <div class="row align-items-center">
          <b-nav-item-dropdown
            v-if="!store.isLoading"
            variant="primary"
            toggle-class="gray"
            class="ml-0 pl-0 mt-3 d-lg-none"
          >
            <template #button-content>
              {{ store.getNetworkContextName() }}
            </template>
            <b-dropdown-item
              v-for="networkContext in Array.from(
                store.networkContexts.values(),
              )"
              :key="networkContext.networkId"
              @click="navigateToNetwork(networkContext.networkId)"
            >
              {{ networkContext.name }}
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
              <li v-if="includeOrganizations" class="nav-item">
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
              <li
                v-if="
                  includeNotify &&
                  !store.isLoading &&
                  !store.fetchingDataFailed &&
                  store.networkId === 'public' &&
                  !store.isSimulation
                "
                class="nav-item"
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
                >
                  <b-icon-bell class="mr-1" scale="0.9" />
                  Notify
                </router-link>
              </li>
              <li v-if="blogUrl" class="nav-item">
                <a
                  class="nav-link"
                  target="_blank"
                  :href="blogUrl"
                  rel="noopener"
                >
                  <b-icon-newspaper class="mr-1" scale="0.9" />
                  Blog
                </a>
              </li>
              <li v-if="apiDocUrl" class="nav-item">
                <a
                  class="nav-link"
                  target="_blank"
                  :href="apiDocUrl"
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
              <search v-if="!store.isLoading && !store.fetchingDataFailed" />
            </form>
          </div>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import {
  BCollapse,
  BDropdownItem,
  BNavbarToggle,
  BNavItemDropdown,
} from "bootstrap-vue";
import Search from "@/components/search.vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";
import NavNetworkSelector from "@/components/layout/NavNetworkSelector.vue";

export interface BrandLogo {
  src: string;
  alt: string;
}

defineProps({
  faqRoute: {
    type: String,
    required: false,
    default: undefined,
  },
  brandName: {
    type: String,
    required: true,
  },
  brandTagline: {
    type: String,
    required: true,
  },
  includeOrganizations: {
    type: Boolean,
    default: true,
  },
  includeNotify: {
    type: Boolean,
    default: false,
  },
  includeFAQ: {
    type: Boolean,
    default: false,
  },
  apiDocUrl: {
    type: String,
    default: undefined,
  },
  blogUrl: {
    type: String,
    default: undefined,
  },
  githubUrl: {
    type: String,
    default: undefined,
  },
  mailTo: {
    type: String,
    default: undefined,
  },
  brandLogo: {
    type: Object as PropType<BrandLogo>,
    required: false,
    default: undefined,
  },
});

const store = useStore();
const route = useRoute();
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

const homeActiveClass = computed(() => {
  return {
    active:
      route.name === "network-dashboard" ||
      route.name === "node-dashboard" ||
      route.name === "organization-dashboard",
  };
});
</script>

<style lang="scss" scoped>
.brand-title {
  color: #4a4a4a; // $primary;
  font-weight: normal;
  font-style: normal;
  font-family: "Poppins", sans-serif;
  font-size: 23px;
  margin-top: 4px;
  margin-left: 3px;
  //filter: brightness(1.5);
}
.brand-tagline {
  font-weight: 600;
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
