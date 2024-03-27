<template>
  <div class="btn-group undo-redo" role="group" aria-label="UndoRedo">
    <div v-tooltip:bottom="'Undo change'">
      <button
        type="button"
        class="btn btn-secondary btn-icon"
        :disabled="!store.hasUndo"
        @click="onUndoUpdate"
      >
        <b-icon-arrow-counterclockwise />
      </button>
    </div>
    <button
      type="button"
      class="btn btn-secondary"
      :disabled="!store.hasUndo"
      @click="onReset"
    >
      Reset simulation
    </button>
    <div v-tooltip:bottom="'Redo change'">
      <button
        type="button"
        class="btn btn-secondary btn-icon"
        :disabled="!store.hasRedo"
        @click="onRedoUpdate"
      >
        <b-icon-arrow-clockwise />
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { BIconArrowClockwise, BIconArrowCounterclockwise } from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

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
