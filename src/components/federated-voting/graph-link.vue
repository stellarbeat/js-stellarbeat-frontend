<template>
  <path
    class="link"
    :d="getLinkPath(link)"
    @click="$emit('linkClick', link)"
  ></path>
</template>
<script setup lang="ts">
import useGraph from "@/composables/useGraph";
import { PropType, Ref, toRefs } from "vue";
import { LinkDatum } from "@/components/federated-voting/GraphManager";

const { getLinkPath } = useGraph();

const props = defineProps({
  link: {
    type: Object as PropType<LinkDatum>,
    required: true,
  },
});

const link: Ref<LinkDatum> = toRefs(props).link;
</script>
<style scoped>
.link {
  fill: none;
  stroke: #1687b2;
  stroke-width: 2px;
  cursor: pointer;
}

.link:hover {
  stroke-width: 4px;
}
</style>
