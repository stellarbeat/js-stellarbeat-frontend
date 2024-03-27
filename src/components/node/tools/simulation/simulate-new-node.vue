<template>
  <portal to="simulate-node-modal">
    <div
      id="simulate-node-modal"
      ref="simulateNodeModal"
      class="modal fade"
      tabindex="-1"
      aria-labelledby="simulateNodeModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="simulateNodeModalLabel" class="modal-title">
              Simulate a new node
            </h5>
            <button
              type="button"
              class="btn-close"
              data-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <input
              v-model="newNodeName"
              type="text"
              class="form-control"
              placeholder="Enter a name"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-dismiss="modal"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              data-dismiss="modal"
              @click="simulateNewNode"
            >
              Simulate Node
            </button>
          </div>
        </div>
      </div>
    </div>
  </portal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

const newNodeName = ref("");
const store = useStore();
const router = useRouter();
const route = useRoute();

function simulateNewNode() {
  const node = new Node(makePublicKey());
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
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 56; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
</script>
<style scoped></style>
