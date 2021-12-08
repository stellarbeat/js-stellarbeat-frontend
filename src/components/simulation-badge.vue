<template>
  <span v-if="store.isSimulation" class="tag mx-2"
    >Simulation mode
    <a
      href="#"
      v-if="!store.isLocalNetwork"
      v-on:click.stop.prevent="store.resetUpdates()"
      class="tag-addon"
      ><b-icon-x />
    </a>
  </span>
</template>
<script lang="ts">
import Store from "@/store/Store";
import { BIconX } from "bootstrap-vue";
import Vue from "vue";
import { Component } from "vue-property-decorator";
import useStore from "@/store/useStore";

@Component({
  components: { BIconX: BIconX },
})
export default class SimulationBadge extends Vue {
  get store(): Store {
    return useStore();
  }
}
</script>
<style scoped></style>
