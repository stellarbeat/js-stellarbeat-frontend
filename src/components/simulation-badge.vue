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
<script setup lang="ts">
import { BIconX } from "bootstrap-vue";
import useStore from "@/store/useStore";
const store = useStore();
</script>
<style scoped></style>
