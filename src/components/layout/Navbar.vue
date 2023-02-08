<template>
  <div>
    <b-navbar toggle-breakpoint="lg" class="m-0 p-0" toggleable="lg">
      <div class="header py-3 my-header">
        <div class="container-fluid" style="max-width: 1360px">
          <div class="d-flex justify-content-between w-100">
            <div class="d-flex">
              <router-link
                v-if="enableBrandImage"
                class="header-brand mr-0 mt-2"
                :to="{ name: 'network-dashboard' }"
              >
                <img
                  :src="brandImageSource"
                  width="27.833"
                  height="32"
                  class="header-brand-img"
                  :alt="brandImage.alt"
                />
              </router-link>
              <div class="d-none d-lg-flex" style="width: 264px"></div>
            </div>
            <div class="d-flex flex-column mr-0">
              <h2 class="brand-title mb-0">{{ brandName }}</h2>
              <h6 class="text-muted brand-tagline mb-0">
                {{ brandTagline }}
              </h6>
            </div>
            <div class="d-none d-lg-flex">
              <div class="d-flex">
                <div class="nav-item pr-0" style="cursor: default">
                  <b-nav-item-dropdown
                    v-if="store.networkContexts.size > 1 && !store.isLoading"
                    style="width: 137px"
                    toggle-class="gray"
                    class="text-gray nav-link px-0"
                  >
                    <template #button-content>
                      {{ store.getNetworkContextName() }}
                    </template>
                    <b-dropdown-item
                      v-for="network in Array.from(
                        store.networkContexts.keys()
                      )"
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
                    class="btn btn-sm bt btn-primary"
                    target="_blank"
                    rel="noopener"
                  >
                    <github />
                    Github</a
                  >
                  <a
                    href="mailto:info@stellarbeat.io"
                    class="btn btn-sm bt btn-primary ml-2"
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
    <b-collapse class="header collapse d-lg-flex p-0" is-nav id="nav_collapse">
      <div class="container-fluid collapser" style="max-width: 1360px">
        <div class="row align-items-center">
          <b-nav-item-dropdown
            variant="primary"
            toggle-class="gray"
            class="ml-0 pl-0 mt-3 d-lg-none"
            v-if="!store.isLoading"
          >
            <template #button-content>
              {{ store.getNetworkContextName() }}
            </template>
            <b-dropdown-item
              v-for="networkContext in Array.from(
                store.networkContexts.values()
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
              <li class="nav-item" v-if="includeOrganizations">
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
                class="nav-item"
                v-if="
                  includeNotify &&
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
                >
                  <b-icon-bell class="mr-1" scale="0.9" />
                  Notify
                </router-link>
              </li>
              <li class="nav-item" v-if="blogUrl">
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
              <li class="nav-item" v-if="apiDocUrl">
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
import { ref, computed, PropType } from "vue";
import {
  BCollapse,
  BDropdownItem,
  BIconBell,
  BIconBuilding,
  BIconBullseye,
  BIconCode,
  BIconEnvelope,
  BIconHouse,
  BIconNewspaper,
  BIconQuestionCircle,
  BNavbar,
  BNavbarToggle,
  BNavItemDropdown,
} from "bootstrap-vue";
import Github from "@/components/organization/logo/github.vue";
import Search from "@/components/search.vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

export interface BrandImage {
  src: string;
  alt: string;
}

const props = defineProps({
  faqRoute: {
    type: String,
    required: false,
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
  },
  blogUrl: {
    type: String,
  },
  githubUrl: {
    type: String,
  },
  mailTo: {
    type: String,
  },
  enableBrandImage: {
    type: Boolean,
    default: true,
  },
  brandImage: {
    type: Object as PropType<BrandImage>,
  },
});

const store = useStore();
const route = useRoute();
const router = useRouter();

const brandImageSource = ref(
  props.brandImage?.src ? require(`@/assets/logo.svg`) : ""
); //require needs to happen before mount
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
@import "src/assets/custom";
.brand-title {
  color: $primary;
  font-weight: 500;
  filter: brightness(1.2);
}
.brand-tagline {
  font-weight: 500;
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
