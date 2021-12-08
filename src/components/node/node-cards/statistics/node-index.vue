<template>
  <div class="card">
    <div class="card-body d-flex flex-row flex-wrap align-items-center p-4">
      <gauge
        width="45px"
        height="45px"
        :value="node.index"
        :max-value="1"
        class="mr-3"
      />
      <div class="lh-sm">
        <div class="strong">
          {{ +node.index.toFixed(2) }}
        </div>
        <div class="text-muted">Node Index</div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Network, Node } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import Gauge from "@/components/charts/gauge.vue";
import useStore from "@/store/useStore";

@Component({
  components: { Gauge },
})
export default class NodeIndex extends Vue {
  @Prop()
  protected node!: Node;

  get store(): Store {
    return useStore();
  }

  get network(): Network {
    return this.store.network;
  }
}
</script>

<style scoped>
.strong {
  font-weight: 500;
}
.text-muted {
  color: #6e7582 !important;
}
</style>
