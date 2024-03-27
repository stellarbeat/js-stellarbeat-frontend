<template>
  <span v-if="store.isSimulation" class="tag mx-2"
    >Simulation mode
    <a
      v-if="!store.isLocalNetwork"
      href="#"
      class="tag-addon"
      @click.stop.prevent="store.resetUpdates()"
      ><b-icon-x />
    </a>
  </span>
</template>
<script setup lang="ts">
import useStore from "@/store/useStore";
import { BIconX } from "bootstrap-vue";

const store = useStore();
</script>
<style scoped></style>
