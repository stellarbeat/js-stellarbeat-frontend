<template>
  <div>
    <div id="sticky">
      <transition name="fade" mode="out-in">
        <div :key="stickyKey">
          <div
            class="
              card-header
              sb-card-header
              d-flex
              inverted
              d-flex
              align-items-start
            "
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

<script lang="ts">
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";
import Store from "@/store/Store";
import UndoRedo from "@/components/node/tools/simulation/UndoRedo.vue";
import stickybits from "stickybits";
import {
  BIcon,
  BFormCheckbox,
  BIconHouse,
  BIconBullseye,
  BIconBuilding,
} from "bootstrap-vue";

@Component({
  components: {
    UndoRedo,
    BIcon,
    BFormCheckbox,
    BIconHouse,
    BIconBullseye,
    BIconBuilding,
  },
})
export default class SideBar extends Vue {
  @Prop()
  stickyKey!: string;

  @Prop()
  icon!: string;

  @Prop({ default: true })
  hasExploreSection!: boolean;

  get store(): Store {
    return this.$root.$data.store;
  }

  get selectedNode() {
    return this.store.selectedNode;
  }

  get network() {
    return this.store.network;
  }

  mounted() {
    stickybits("#sticky");
  }
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
  margin-bottom: 0px;
  margin-left: 0px;
  padding-left: 21px !important;
}

.sb-card-title {
  line-height: 1 !important;
  margin-bottom: 2px !important;
}

.sb-card-title-icon {
  opacity: 0.8;
  color: #1997c6;
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
  padding-left: 0px;
}

.success {
}

.danger {
  color: #cd201f;
}
</style>
