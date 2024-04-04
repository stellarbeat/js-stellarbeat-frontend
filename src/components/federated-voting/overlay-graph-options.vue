<template>
  <div
    id="overlay-graph-options"
    class="d-flex justify-content-around align-items-baseline"
  >
    <div class="d-flex align-items-center">
      <div>
        <label for="graph-topology" class="graph-topology-label mb-0 pb-0 mr-1"
          >Topology</label
        >
        <select id="graph-topology" v-model="topology">
          <option value="complete">Complete</option>
          <option value="random">Random</option>
          <option value="ring">Ring</option>
        </select>
      </div>
    </div>

    <div class="d-flex align-items-center">
      <label for="repelling-force" class="repelling-force-label mb-0 pb-0 mr-1"
        >Size
      </label>
      <input
        id="repelling-force"
        v-model="repellingForce"
        type="range"
        min="100"
        max="10000"
        @change="$emit('updateRepellingForce', repellingForce)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { isString } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";
import { isNumber } from "chart.js/helpers";
import { ref, toRefs, watch } from "vue";

const props = defineProps<{
  initialRepellingForce: number;
  initialTopology: string;
}>();

const { initialRepellingForce, initialTopology } = toRefs(props);
const repellingForce = ref(initialRepellingForce.value);
const topology = ref(initialTopology.value); // Default to 'complete'

const emit = defineEmits({
  updateTopology: (topology: string) => {
    return isString(topology);
  },
  updateRepellingForce: (repellingForce: number) => {
    return isNumber(repellingForce);
  },
});

watch(topology, (newTopology: string) => {
  emit("updateTopology", newTopology);
});
</script>
<style scoped>
.graph-topology-label {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.repelling-force-label {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.title {
  color: #333;
  font-size: 24px;
  font-weight: bold;
}

.graph-topology-label {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.repelling-force-label {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}
</style>
