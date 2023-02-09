<template>
  <div class="">
    <b-modal
      ok-title="Simulate Node"
      size="lg"
      id="simulate-node-modal"
      title="Simulate a new node"
      v-on:ok="simulateNewNode"
    >
      <b-form-input
        v-model="newNodeName"
        placeholder="Enter a name"
      ></b-form-input>
    </b-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Node } from "@stellarbeat/js-stellarbeat-shared";

import { BFormInput, BModal } from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

const newNodeName = ref("");
const store = useStore();
const router = useRouter();
const route = useRoute();

function simulateNewNode() {
  let node = new Node(makePublicKey());
  node.name = newNodeName.value === "" ? "MyNewNode" : newNodeName.value;
  node.quorumSet.threshold = 1;
  node.active = true;
  node.isValidating = true;
  store.addNodeToNetwork(node);
  router.push({
    name: "node-dashboard",
    params: { publicKey: node.publicKey },
    query: {
      center: "1",
      "no-scroll": "1",
      view: route.query.view,
      network: route.query.network,
      at: route.query.at,
    },
  });
}

function makePublicKey() {
  let result = "G";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 56; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
</script>
<style scoped></style>
