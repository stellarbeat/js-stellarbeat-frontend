<template>
  <b-modal
    id="network-analysis-top-tier-info"
    ref="topTierInfoModal"
    lazy
    hide-header
  >
    <h3>Top tier</h3>
    <p class="my-4">
      The top tier is the set of nodes in the network that is exclusively
      relevant when determining the liveness and safety "buffers" of the
      network. These nodes can be grouped by organization, country and isp.
    </p>

    <h3>When is the top tier symmetric?</h3>
    <p class="my-4">
      The top tier is symmetric when all of its nodes have the same quorumset
      configuration.
    </p>

    <h3>Learn more</h3>
    <p class="my-4">
      If you want to learn more about the top tier concept, check out the
      following
      <a
        target="_blank"
        rel="noopener"
        href="https://arxiv.org/pdf/2002.08101.pdf"
        >white paper</a
      >
    </p>
    <template #modal-footer>
      <div class="w-100">
        <p class="float-left">
          Powered by
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/wiberlin/fbas_analyzer"
            >wiberlin/fbas_analyzer</a
          >
        </p>
        <button class="btn btn-sm btn-primary float-right" @click="hideModal">
          Close
        </button>
      </div>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { BModal } from "bootstrap-vue";

import { ref } from "vue";

const topTierInfoModal = ref(null);
function hideModal() {
  if (topTierInfoModal.value) (topTierInfoModal.value as BModal).hide();
}
</script>
