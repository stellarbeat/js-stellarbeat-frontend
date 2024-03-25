<template>
  <div>
    <div id="sticky">
      <transition name="fade" mode="out-in">
        <div :key="stickyKey">
          <div
            class="card-header sb-card-header d-flex inverted d-flex align-items-start"
          >
            <div class="d-flex align-items-start">
              <h3 class="title-icon">
                <b-icon
                  scale="0.8"
                  class="bg-success rounded mr-1"
                  variant="light"
                  :icon="icon"
                />
              </h3>
              <div class="d-flex flex-column">
                <h3 class="card-title sb-card-title">
                  <slot name="title" />
                </h3>
                <h6 class="sb-card-subtitle">
                  <slot name="sub-title" />
                </h6>
              </div>
            </div>
          </div>
          <div class="card-body px-4 pt-1">
            <div class="sb-nav-bar">
              <h6 v-if="hasExploreSection" class="sb-navbar-heading">
                Explore
              </h6>
              <div v-if="hasExploreSection" class="overflow">
                <div>
                  <ul v-if="!store.isLoading" class="sb-nav-list">
                    <slot name="explore-list-items"></slot>
                  </ul>
                </div>
              </div>
              <h6 class="sb-navbar-heading mt-4">Tools</h6>
              <ul class="sb-nav-list">
                <slot name="tool-list-items"></slot>
              </ul>

              <h6 class="sb-navbar-heading">Info</h6>
              <div class="overflow">
                <div>
                  <ul class="sb-nav-list">
                    <li class="sb-nav-item">
                      <nav-link
                        v-b-modal.networkProps
                        :title="'Stellarbeat configuration'"
                        :show-icon="true"
                        icon="info-circle"
                      ></nav-link>
                      <b-modal
                        id="networkProps"
                        lazy
                        size="lg"
                        title="Stellarbeat configuration"
                        ok-only
                        ok-title="Close"
                      >
                        <table class="table card-table">
                          <tbody class="text-gray">
                            <tr>
                              <td class="px-0 info-title">
                                <b-icon-info-circle
                                  v-b-tooltip.hover="
                                    'Overlay version stellarbeat uses to connect to other nodes'
                                  "
                                ></b-icon-info-circle>
                                Overlay version
                              </td>
                              <td class="px-0 text-right">
                                {{ store.network.overlayVersion }}
                              </td>
                            </tr>
                            <tr>
                              <td class="px-0 info-title">
                                <b-icon-info-circle
                                  v-b-tooltip.hover="
                                    'Minimum allowed overlay version for nodes'
                                  "
                                ></b-icon-info-circle>
                                Minimum overlay version
                              </td>
                              <td class="px-0 text-right">
                                {{ store.network.overlayMinVersion }}
                              </td>
                            </tr>
                            <tr>
                              <td class="px-0 info-title">
                                <b-icon-info-circle
                                  v-b-tooltip.hover="
                                    'Stellar core version to determine if a node is outdated'
                                  "
                                ></b-icon-info-circle>
                                Stellar Core version
                              </td>
                              <td class="px-0 text-right">
                                {{ store.network.stellarCoreVersion }}
                              </td>
                            </tr>
                            <tr>
                              <td class="px-0 info-title">
                                <b-icon-info-circle
                                  v-b-tooltip.hover="
                                    'Maximum supported ledger version'
                                  "
                                ></b-icon-info-circle>
                                Maximum ledger version
                              </td>
                              <td class="px-0 text-right">
                                {{ store.network.maxLedgerVersion }}
                              </td>
                            </tr>
                            <tr v-if="store.network.quorumSetConfiguration">
                              <td class="px-0 info-title">
                                <b-icon-info-circle
                                  v-b-tooltip.hover="
                                    'Quorum set to decide the correct externalized ledger values and basis for network analysis'
                                  "
                                ></b-icon-info-circle>
                                Quorum set
                              </td>
                              <td class="text-left">
                                <pre><code>{{
                                                                prettifyBaseQuorumSet(store.network.quorumSetConfiguration, store.network)
                                                                }}</code></pre>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </b-modal>
                    </li>
                    <slot name="info"></slot>
                  </ul>
                </div>
              </div>
              <h6 class="sb-navbar-heading mt-3">Options</h6>
              <ul class="sb-nav-list">
                <li class="sb-nav-item">
                  <b-form-checkbox
                    v-model="store.includeWatcherNodes"
                    name="include-watcher-nodes-button"
                    class="sb-nav-item sb-nav-toggle"
                    switch
                  >
                    Watcher nodes
                  </b-form-checkbox>
                </li>
              </ul>
              <undo-redo v-if="store.isSimulation || store.hasRedo" />
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import Vue from "vue";
import UndoRedo from "@/components/node/tools/simulation/UndoRedo.vue";
import {
  BFormCheckbox,
  BIcon,
  BIconBuilding,
  BIconBullseye,
  BIconInfoCircle,
  BModal,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import NavLink from "@/components/side-bar/nav-link.vue";
import { BaseQuorumSet, Network } from "@stellarbeat/js-stellarbeat-shared";

Vue.component("BIconBullseye", BIconBullseye);
Vue.component("BIconBuilding", BIconBuilding);
Vue.component("BIconInfoCircle", BIconInfoCircle);

defineProps({
  stickyKey: {
    type: String,
    required: false,
    default: undefined,
  },
  icon: {
    type: String,
    required: false,
    default: undefined,
  },
  hasExploreSection: {
    type: Boolean,
    default: true,
  },
});

const store = useStore();

function prettifyBaseQuorumSet(
  qSet: BaseQuorumSet,
  network: Network,
): Record<string, unknown> {
  return {
    threshold: qSet.threshold,
    validators: qSet.validators.map((validator) =>
      network.getNodeByPublicKey(validator).name
        ? network.getNodeByPublicKey(validator).name +
          " (" +
          network.getNodeByPublicKey(validator).publicKey.substring(0, 4) +
          "..." +
          network
            .getNodeByPublicKey(validator)
            .publicKey.substring(
              50,
              network.getNodeByPublicKey(validator).publicKey.length,
            ) +
          ")"
        : network.getNodeByPublicKey(validator).displayName,
    ),
    innerQuorumSets: qSet.innerQuorumSets.map((innerQSet) =>
      prettifyBaseQuorumSet(innerQSet, network),
    ),
  };
}
</script>
<style scoped>
.overflow {
  overflow-y: auto;
  max-height: calc(100vh - 22rem);
}

.sb-card-header {
  border: none !important;
  margin-top: 18px;
  margin-bottom: 0;
  margin-left: 0;
  padding-left: 21px !important;
}

.sb-card-title {
  line-height: 1 !important;
  margin-bottom: 2px !important;
}

.title-icon {
  font-size: 2rem;
  margin-bottom: 0;
}

.sb-card-subtitle {
  opacity: 0.7;
  font-weight: 500;
  margin-bottom: 0;
}

.sb-nav-bar {
  list-style: none;
  flex: 0 0 220px;
}

.sb-nav-list {
  padding-left: 0;
}

.info-title {
  font-weight: 600;
}

#sticky {
  position: sticky;
  top: 0;
}
</style>
