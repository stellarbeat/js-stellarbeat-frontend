<template>
  <g
    :transform="getNodeTransform(node)"
    class="node-container"
    @click="$emit('nodeClick', node)"
  >
    <circle class="node" r="8"></circle>
    <g>
      <rect
        class="label-rect"
        :width="getLabelWidth(node.name, 10) + 'px'"
        height="13px"
        y="10"
        :x="getLabelX(node.name, 10)"
        rx="2"
      ></rect>
      <text color="#1687b2" class="label-text" y="5" dy="1.3em">
        {{ truncate(node.name, 10) }}
        <title>{{ node.name }}</title>
      </text>
    </g>
  </g>
</template>
<script setup lang="ts">
import { useTruncate } from "@/composables/useTruncate";
import useGraph from "@/composables/useGraph";
import { NodeDatum } from "@/components/federated-voting/GraphManager";
import { PropType, Ref, toRefs } from "vue";

const truncate = useTruncate();
const { getLabelX, getLabelWidth, getNodeTransform } = useGraph();

const props = defineProps({
  node: {
    type: Object as PropType<NodeDatum>,
    required: true,
  },
});

const node: Ref<NodeDatum> = toRefs(props).node;
</script>
<style scoped>
.node {
  fill: #1687b2;
  stroke: #fff;
  stroke-width: 2px;
}

.label-text {
  font-size: 12px;
  text-anchor: middle;
  font-weight: 400;
  fill: #1687b2;
  text-transform: lowercase;
}

.label-rect {
  fill: white;
  opacity: 0.9;
}

.node-container {
  cursor: pointer;
}
</style>
