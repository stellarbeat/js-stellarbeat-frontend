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
<script setup lang="ts">
import { computed, defineProps, ref } from "vue";
import { Node } from "@stellarbeat/js-stellar-domain";
import NodesTable from "@/components/node/nodes-table.vue";
import { BBadge, BIconSearch } from "bootstrap-vue";
import useStore from "@/store/useStore";

defineProps<{
  node: Node;
}>();

const store = useStore();
const network = store.network;

const filter = ref("");

const fields = computed(() => {
  let fields = [{ key: "name", label: "Node", sortable: true }];

  if (store.networkContext.enableIndex && !store.isSimulation) {
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
});

const numberOfActiveNodes = computed(() => {
  if (store.includeWatcherNodes)
    return network.nodes.filter((node) => !network.isNodeFailing(node)).length;
  else
    return network.nodes.filter(
      (node) => node.isValidator && !network.isNodeFailing(node)
    ).length;
});

const validators = computed(() => {
  return network.nodes
    .filter((node) => node.isValidator || store.includeWatcherNodes)
    .map((node) => {
      return {
        isFullValidator: node.isFullValidator,
        name: node.displayName,
        index: node.index,
        publicKey: node.publicKey,
      };
    });
});
</script>
