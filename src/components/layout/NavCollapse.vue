<template>
  <div id="nav_collapse" class="collapse navbar-collapse header d-lg-flex p-0">
    <div class="container-fluid collapser" style="max-width: 1360px">
      <div class="row align-items-center">
        <NavNetworkSelector class="d-lg-none ml-3 mt-4 mb-1" />
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
            <Search v-if="!store.isLoading && !store.fetchingDataFailed" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, type PropType } from "vue";
import useStore from "@/store/useStore";
import { useRoute } from "vue-router/composables";
import { type BrandLogo } from "@/components/layout/Navbar.vue";
import NavNetworkSelector from "@/components/layout/NavNetworkSelector.vue";
import Search from "@/components/search.vue";
import {
  BIconBell,
  BIconBuilding,
  BIconBullseye,
  BIconCode,
  BIconHouse,
  BIconNewspaper,
  BIconQuestionCircle,
} from "bootstrap-vue";

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
.collapser {
  background: white;
}
</style>
