<template>
  <span v-if="store.isTimeTravel && !store.isSimulation" class="tag mx-2"
    >Time Travel
    <a href="#" v-on:click.stop.prevent="resetTimeTravel()" class="tag-addon"
      ><b-icon-x />
    </a>
  </span>
</template>
<script setup lang="ts">
import { BIconX } from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

const store = useStore();
const route = useRoute();
const router = useRouter();

function resetTimeTravel() {
  const query = store.copyAndModifyObject(route.query, [], ["at"]);
  router.push({
    name: route.name ? route.name : undefined,
    params: route.params,
    query: query as Record<string, string | Array<string>>,
  });
}
</script>
<style scoped></style>
