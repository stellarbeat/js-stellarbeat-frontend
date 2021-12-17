<template>
  <div class="card">
    <div class="card-header pl-3">
      <h1 class="card-title">
        <b-badge variant="success">{{ numberOfActiveNodes }}</b-badge>
        active
        {{ store.includeWatcherNodes ? "nodes" : "validators" }}
      </h1>
      <div class="card-options">
        <form>
          <div class="input-group">
            <input
              type="text"
              class="form-control form-control-sm"
              placeholder="Search"
              name="s"
              v-model="filter"
            />
            <div class="input-icon-addon">
              <b-icon-search />
            </div>
          </div>
        </form>
      </div>
    </div>
    <nodes-table
      :filter="filter"
      :nodes="validators"
      :fields="fields"
      per-page="5"
    />
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Network, Node } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import NodesTable from "@/components/node/nodes-table.vue";
import { BBadge, BIconSearch } from "bootstrap-vue";
import useStore from "@/store/useStore";

@Component({
  components: { NodesTable, BIconSearch: BIconSearch, BBadge: BBadge },
})
export default class NetworkNodes extends Vue {
  @Prop()
  node!: Node;

  protected filter = "";

  get fields() {
    let fields = [{ key: "name", label: "Node", sortable: true }];

    if (this.store.networkContext.enableIndex && !this.store.isSimulation) {
      fields.push({ key: "index", label: "Index", sortable: true });
    }

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

  get numberOfActiveNodes(): number {
    if (this.store.includeWatcherNodes)
      return this.network.nodes.filter(
        (node) => !this.network.isNodeFailing(node)
      ).length;
    else
      return this.network.nodes.filter(
        (node) => node.isValidator && !this.network.isNodeFailing(node)
      ).length;
  }

  get validators() {
    return this.network.nodes
      .filter((node) => node.isValidator || this.store.includeWatcherNodes)
      .map((node) => {
        return {
          isFullValidator: node.isFullValidator,
          name: node.displayName,
          index: node.index,
          publicKey: node.publicKey,
        };
      });
  }
}
</script>
