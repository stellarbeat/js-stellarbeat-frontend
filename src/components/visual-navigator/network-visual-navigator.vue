<template>
  <div
    class="card"
    :class="{
      'card-fullscreen': fullScreen,
      'sb-card-fullscreen': fullScreen,
    }"
    style="height: 600px"
  >
    <div v-show="menuVisible" class="menu border-right p-3">
      <div
        class="text-gray collapse-icon"
        role="button"
        tabindex="0"
        @click="menuVisible = false"
      >
        <b-icon-chevron-double-left font-scale="1" />
      </div>
      <div class="d-flex flex-column justify-content-between h-100">
        <div>
          <h6 class="sb-navbar-heading mt-3 ml-0 pl-0">View</h6>
          <div class="mt-3">
            <ul style="list-style: none" class="pl-0">
              <router-link
                tag="li"
                :to="{
                  path: $route.path,
                  query: {
                    view: 'graph',
                    'no-scroll': '1',
                    network: $route.query.network,
                    at: $route.query.at,
                  },
                }"
                :class="
                  isString($route.query.view) &&
                  ['graph', undefined].includes($route.query.view) &&
                  'router-link-exact-active'
                "
                class="pl-3 mb-1 view-link"
                role="button"
                tabindex="0"
                @click.native="menuVisible = false"
              >
                Node trust graph
              </router-link>
              <router-link
                tag="li"
                :to="{
                  path: $route.path,
                  query: {
                    view: 'graph-org',
                    'no-scroll': '1',
                    network: $route.query.network,
                    at: $route.query.at,
                  },
                }"
                :class="
                  isString($route.query.view) &&
                  ['graph-org'].includes($route.query.view) &&
                  'router-link-exact-active'
                "
                class="pl-3 mb-1 view-link"
                role="button"
                tabindex="0"
                @click.native="menuVisible = false"
              >
                Organization trust graph
              </router-link>
              <router-link
                tag="li"
                :to="{
                  path: $route.path,
                  query: {
                    view: 'map',
                    'no-scroll': '1',
                    network: $route.query.network,
                    at: $route.query.at,
                  },
                }"
                class="pl-3 mb-1 view-link"
                role="button"
                tabindex="0"
                :class="
                  $route.query.view === 'map' && 'router-link-exact-active'
                "
                @click.native="menuVisible = false"
                >Map
              </router-link>
            </ul>
          </div>
          <h6
            v-if="view === 'graph' || view === 'graph-org'"
            class="sb-navbar-heading mt-3 ml-0 pl-0"
          >
            Options
          </h6>
          <div v-if="view === 'graph' || view === 'graph-org'">
            <b-form-checkbox
              v-show="selectedNode || selectedOrganization"
              v-model="optionHighlightTrustedNodes"
              class="sb-nav-item sb-nav-toggle mt-1"
              switch
            >
              Highlight trusted nodes
            </b-form-checkbox>
            <b-form-checkbox
              v-show="selectedNode || selectedOrganization"
              v-model="optionHighlightTrustingNodes"
              class="sb-nav-item sb-nav-toggle mt-1"
              switch
            >
              Highlight trusting nodes
            </b-form-checkbox>
            <b-form-checkbox
              v-model="optionShowFailingEdges"
              class="sb-nav-item sb-nav-toggle mt-1"
              switch
            >
              Show failing edges
            </b-form-checkbox>
            <b-form-checkbox
              v-model="optionTransitiveQuorumSetOnly"
              class="sb-nav-item sb-nav-toggle mt-1"
              switch
            >
              Transitive quorum set only
            </b-form-checkbox>
          </div>
        </div>
        <div>
          <graph-legend v-if="view === 'graph' || view === 'graph-org'" />
        </div>
      </div>
    </div>
    <div class="card-header m-0 p-0 d-flex border-0">
      <div
        class="menu-button ml-3 text-gray"
        role="button"
        tabindex="0"
        @click="menuVisible = true"
      >
        <b-icon-list font-scale="2" />
      </div>
      <div class="pl-3 sb-bread-crumbs-container py-0">
        <b-breadcrumb class="sb-bread-crumbs" :items="breadCrumbs">
        </b-breadcrumb>
      </div>
      <a
        v-if="!fullScreen"
        v-tooltip="'Fullscreen'"
        href="#"
        class="card-options-fullscreen mx-4"
        @click.prevent.stop="fullScreen = true"
      >
        <b-icon-fullscreen />
      </a>
      <a
        v-else
        v-tooltip="'Exit fullscreen'"
        href="#"
        class="card-options-fullscreen mx-4"
        @click.prevent.stop="fullScreen = false"
      >
        <b-icon-fullscreen-exit />
      </a>
    </div>
    <div class="card-body p-0 h-100">
      <div
        v-if="network.nodesTrustGraph.networkTransitiveQuorumSet.size === 0"
        class="card-alert alert alert-danger"
        show
      >
        No transitive quorum set detected in network!
      </div>
      <div v-if="view === 'map'" style="height: 100%">
        <div class="world-loader">
          <div class="loader"></div>
        </div>
        <world-map :full-screen="fullScreen" />
      </div>
      <network-graph-card
        v-else
        :full-screen="fullScreen"
        :option-show-failing-edges="optionShowFailingEdges"
        :option-highlight-trusting-nodes="optionHighlightTrustingNodes"
        :option-highlight-trusted-nodes="optionHighlightTrustedNodes"
        :option-show-regular-edges="optionShowRegularEdges"
        :option-transitive-quorum-set-only="optionTransitiveQuorumSetOnly"
        :type="view === 'graph' ? 'node' : 'organization'"
      >
      </network-graph-card>

      <div v-show="!menuVisible" class="preview" @click="navigateToView">
        <img
          v-if="view === 'map'"
          src="@/assets/graph-preview.png"
          alt="graph-preview"
          class="preview-image"
          width="60"
          height="60"
        />
        <img
          v-else
          src="@/assets/map-preview.png"
          alt="map-preview"
          class="preview-image"
          width="60"
          height="60"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import NetworkGraphCard from "@/components/visual-navigator/network-graph-card.vue";
import {
  BBreadcrumb,
  BFormCheckbox,
  BIconChevronDoubleLeft,
  BIconFullscreen,
  BIconFullscreenExit,
  BIconList,
} from "bootstrap-vue";
import GraphLegend from "@/components/visual-navigator/graph/graph-legend.vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";
import { isString } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";

const WorldMap = defineAsyncComponent(
  () => import("@/components/visual-navigator/world-map.vue"),
);

const props = defineProps({
  view: {
    type: String,
    default: "map",
  },
});
const view = computed(() => props.view);

const store = useStore();
const network = store.network;
const route = useRoute();
const router = useRouter();

const selectedNode = computed(() => {
  return store.selectedNode;
});

const selectedOrganization = computed(() => {
  return store.selectedOrganization;
});

const optionShowFailingEdges = ref(false);
const optionHighlightTrustingNodes = ref(true);
const optionHighlightTrustedNodes = ref(true);
const optionShowRegularEdges = ref(true);
const optionTransitiveQuorumSetOnly = ref(false);

const menuVisible = ref(false);
const fullScreen = ref(false);

const breadCrumbs = computed(() => {
  const crumbs = [];
  crumbs.push({
    text: store.getNetworkContextName(),
    to: {
      name: "network-dashboard",
      query: {
        view: route.query.view,
        network: route.query.network,
        at: route.query.at,
      },
    },
  });

  if (selectedNode.value) {
    if (
      selectedNode.value.organizationId &&
      network.getOrganizationById(selectedNode.value.organizationId)
    )
      crumbs.push({
        text: network.getOrganizationById(selectedNode.value.organizationId)
          .name,
        to: {
          name: "organization-dashboard",
          params: {
            organizationId: selectedNode.value.organizationId,
          },
          query: {
            view: route.query.view,
            network: route.query.network,
            at: route.query.at,
          },
        },
        active: false,
      });
    crumbs.push({
      text: selectedNode.value.displayName,
      active: true,
    });
  } else if (selectedOrganization.value)
    crumbs.push({
      text: selectedOrganization.value.name,
      active: true,
    });
  return crumbs;
});

function navigateToView() {
  const toView = view.value === "map" ? "graph" : "map";
  router.push({
    name: route.name ? route.name : undefined,
    params: route.params,
    query: {
      view: toView,
      "no-scroll": "1",
      network: route.query.network,
      at: route.query.at,
    },
  });
}
</script>
<style scoped>
.sb-bread-crumbs {
  background: white !important;
  margin: 0;
  padding: 0;
  align-self: center;
}

.sb-card-fullscreen {
  z-index: 4;
  height: 100% !important;
}

.collapse-icon {
  cursor: pointer;
  position: absolute;
  right: 8px;
  top: 10px;
}

.menu {
  z-index: 5000;
  position: absolute;
  background: white;
  width: 250px;
  height: 100%;
}

.menu-button {
  cursor: pointer;
}

.view-link {
  text-underline: none;
  padding-left: 7px;
  color: #818181;
  cursor: pointer;
}

.view-link-active {
}

.view-link a {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.55);
}

.view-link:hover {
  background-color: #f8f9fa;
  text-decoration: none;
}

.router-link-exact-active {
  color: #206bc4 !important;
  text-decoration: none;
  background-color: rgba(32, 107, 196, 0.06);
}

.preview-text {
  position: absolute;
  bottom: 0;
  height: 25px;
  color: white;
  width: 100%;
  text-align: center;
  border-radius: 5px;
  background: linear-gradient(
    0deg,
    rgba(67, 104, 113, 1) 0%,
    rgba(170, 211, 223, 1) 100%
  );
}

.preview-image {
  border-radius: 5px;
}

.preview {
  z-index: 1000;
  position: absolute;
  left: 10px;
  bottom: 10px;
  width: 60px;
  height: 60px;
  border-radius: 5px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  background: white;
}

.sb-bread-crumbs {
  background-color: white;
  margin: 0;
  padding: 0;
  align-self: center;
}

.sb-bread-crumbs-container {
  display: flex;
  flex-grow: 1;
  align-items: center;
}

.world-loader {
  position: absolute;
  left: 50%;
  right: 50%;
  top: 30%;
}
</style>
