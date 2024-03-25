<template>
  <path :class="classObject" :d="hullLine" />
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue";
import { polygonHull } from "d3-polygon";
import { curveCatmullRomClosed, line } from "d3-shape";

const props = defineProps({
  greatest: {
    type: Boolean,
    default: false,
  },
  vertexCoordinates: {
    type: Array,
    required: true,
  },
});

const { greatest, vertexCoordinates } = toRefs(props);

const hullLine = computed(() => {
  const hull = polygonHull(vertexCoordinates.value as [number, number][]);
  if (!hull) return null;

  const valueLine = line()
    .x(function (d) {
      return d[0];
    })
    .y(function (d) {
      return d[1];
    })
    .curve(curveCatmullRomClosed); //we want a smooth line

  const hullLine = valueLine(hull);
  if (hullLine) {
    return hullLine;
  }

  return null;
});

const classObject = computed(() => {
  return {
    scc: !greatest.value,
    greatest: greatest.value,
  };
});
</script>

<style scoped lang="scss">
@import "src/assets/variables";
.scc {
  opacity: 0.1;
  fill: transparent;
  stroke: $graph-primary;
  stroke-width: 10px;
}

.greatest {
  opacity: 0.1;
  fill: $graph-primary;
  stroke: $graph-primary;
  stroke-width: 10px;
}
</style>
