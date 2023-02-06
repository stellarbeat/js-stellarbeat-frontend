<template>
  <b-modal
    lazy
    id="network-analysis-safety-info"
    ref="safetyInfoModal"
    hide-header
  >
    <h3>What does this analysis show?</h3>
    <p class="my-4">
      The network is scanned for sets of nodes that contains intersections of
      one or more quorum pairs (network splitting sets). It reports the minimum
      sizes as a risk analysis, and lists all the sets. These nodes can be
      grouped by organization, isp and country.
    </p>
    <h3>What does it mean?</h3>
    <p class="my-4">
      If all nodes in a network splitting set are malicious, they can cause the
      network to diverge and split. For example, if the chart indicates the
      minimum size is 3, then 3 specific nodes would have to maliciously
      cooperate to cause the network to lose safety.<br /><br />
      If a splitting set of size zero is found, this means that there is no
      intersection between some quorums. This could cause the network to split
      if the quorums agree on different values. To solve this the configurations
      of the validator nodes causing the loss of quorum intersection have to be
      changed.
    </p>
    <h3>Limitations of the analysis</h3>
    <p class="my-4">
      If quorum intersection is failing, additional analysis is needed. Safety
      could still be present for the majority of the network.<br />
      Because quorum intersection is calculated for the entire network, it could
      be that badly configured nodes on the edge of the network can cause quorum
      intersection to fail.<br />
      To mitigate this, stellarbeat filters out 'badly configured' nodes. At the
      moment these are nodes that have only themselves in their quorumset. For
      ISP and country information of nodes we rely on the
      <a href="https://ipstack.com/">IPstack api</a>. This data is not
      guaranteed to be correct.
    </p>
    <h3>More information</h3>
    <p class="my-4">
      If you want to learn more about network splitting sets, check out the
      following
      <a target="_blank" href="https://arxiv.org/pdf/2002.08101.pdf"
        >white paper</a
      >, more specific the section regarding minimal splitting sets.
    </p>
    <template v-slot:modal-footer>
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
        <b-button
          variant="primary"
          size="sm"
          class="float-right"
          @click="hideModal"
        >
          Close
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script setup lang="ts">
import { BModal, BButton } from "bootstrap-vue";

import { ref } from "vue";
const safetyInfoModal = ref(null);
function hideModal() {
  if (safetyInfoModal.value) (safetyInfoModal.value as BModal).hide();
}
</script>
