<template>
  <span v-if="store.isTimeTravel && !store.isSimulation" class="tag mx-2"
    >Time Travel
    <a href="#" class="tag-addon" @click.stop.prevent="resetTimeTravel()"
      ><b-icon-x />
    </a>
  </span>
</template>
<script setup lang="ts">
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";
import { BIconX } from "bootstrap-vue";

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
