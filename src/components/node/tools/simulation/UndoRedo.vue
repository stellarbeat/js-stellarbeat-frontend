<template>
  <div class="btn-group undo-redo" role="group" aria-label="UndoRedo">
    <div v-b-tooltip:hover.bottomright="'Undo change'">
      <button
        type="button"
        class="btn btn-secondary btn-icon"
        v-on:click="onUndoUpdate"
        :disabled="!store.hasUndo"
      >
        <b-icon-arrow-counterclockwise />
      </button>
    </div>
    <button
      type="button"
      class="btn btn-secondary"
      v-on:click="onReset"
      :disabled="!store.hasUndo"
    >
      Reset simulation
    </button>
    <div v-b-tooltip:hover.bottomleft="'Redo change'">
      <button
        type="button"
        class="btn btn-secondary btn-icon"
        v-on:click="onRedoUpdate"
        :disabled="!store.hasRedo"
      >
        <b-icon-arrow-clockwise />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import Vue from "vue";
import {
  BIconArrowClockwise,
  BIconArrowCounterclockwise,
  VBTooltip,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

Vue.directive("b-tooltip", VBTooltip);

const store = useStore();
const router = useRouter();
const route = useRoute();

function onUndoUpdate() {
  store.undoUpdate();
  resetRouteIfNoSelectedNode();
}

function onRedoUpdate() {
  store.redoUpdate();
}

function onReset() {
  store.resetUpdates();
  resetRouteIfNoSelectedNode();
}

function resetRouteIfNoSelectedNode() {
  if (
    store.selectedNode &&
    !store.network.getNodeByPublicKey(store.selectedNode.publicKey)
  ) {
    router.push({
      name: "network-dashboard",
      query: {
        "no-scroll": "1",
        network: route.query.network,
        view: route.query.view,
        at: route.query.at,
      },
    });
  }
}
</script>

<style scoped>
.undo-redo {
  opacity: 0.75;
}
</style>
