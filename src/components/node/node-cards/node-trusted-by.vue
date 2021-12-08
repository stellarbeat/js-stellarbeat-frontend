<template>
  <div class="card">
    <div class="card-header">
      <h1 class="card-title">
        Trusted by
        <b-badge variant="success">{{ nodes.length }}</b-badge> nodes
      </h1>
    </div>
    <nodes-table :nodes="nodes" :fields="fields" per-page="5" />
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Network, Node } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import NodesTable from "@/components/node/nodes-table.vue";
import { BBadge } from "bootstrap-vue";
import useStore from "@/useStore";

@Component({
  components: { NodesTable, BBadge: BBadge },
})
export default class NodeTrustedBy extends Vue {
  @Prop()
  node!: Node;

  get fields() {
    let fields = [{ key: "name", label: "Node", sortable: true }];

    if (!this.store.isSimulation)
      fields.push({ key: "index", label: "index", sortable: true });

    fields.push({
      key: "action",
      label: "",
      sortable: false,
      //@ts-ignore
      tdClass: "action",
    });

    return fields;
  }

  get store(): Store {
    return useStore();
  }

  get network(): Network {
    return this.store.network;
  }

  get nodes() {
    return this.network.getTrustingNodes(this.node).map((validator) => {
      return {
        isFullValidator: validator.isFullValidator,
        name: validator.displayName,
        publicKey: validator.publicKey,
        index: validator.index,
      };
    });
  }
}
</script>
