<template>
  <div v-if="selectedNode">
    <b-alert :show="network.isNodeFailing(selectedNode)" variant="danger">
      {{ network.getNodeFailingReason(selectedNode).description }}
    </b-alert>

    <b-alert
      :show="NodeWarningDetector.nodeHasWarning(selectedNode, network)"
      variant="warning"
    >
      <strong>Detected warning(s)</strong>
      <ul class="pl-3 ml-0">
        <li
          v-bind:key="reason"
          v-for="reason in NodeWarningDetector.getNodeWarningReasons(
            selectedNode,
            network
          )"
        >
          {{ reason }}.
        </li>
      </ul>
    </b-alert>

    <b-alert
      :show="network.historyArchiveHasError(selectedNode)"
      variant="warning"
    >
      <strong>History archive issue details</strong>
      <br />
      <span v-html="historyArchiveErrorDescription"></span>
      with
      <a
        href="https://github.com/stellar/go/tree/master/tools/stellar-archivist"
        target="_blank"
        >Stellar Archivist</a
      >
      and purge your cache afterwards.
    </b-alert>
    <b-alert
      :show="historyArchiveScan ? historyArchiveScan.isSlow : false"
      variant="info"
    >
      Only latest ledgers in history archive are scanned for errors because
      archive has limited throughput.
    </b-alert>
    <div class="row row-cards row-deck" v-if="!store.isSimulation">
      <div class="col-sm-12 col-md-6 col-xl-3">
        <node-index :node="selectedNode" />
      </div>

      <div class="col-sm-12 col-md-6 col-xl-3" v-if="selectedNode.isValidator">
        <NodeStatistics24HValidating :node="selectedNode" />
      </div>

      <div class="col-sm-12 col-md-6 col-xl-3" v-else>
        <NodeStatistics24HActive :node="selectedNode" />
      </div>

      <div class="col-sm-12 col-md-6 col-xl-3" v-if="selectedNode.isValidator">
        <NodeStatistics30DValidating :node="selectedNode" />
      </div>

      <div class="col-sm-12 col-md-6 col-xl-3" v-else>
        <NodeStatistics30DActive :node="selectedNode" />
      </div>

      <div class="col-sm-12 col-md-6 col-xl-3">
        <NodeStatistics30DOverloaded :node="selectedNode" />
      </div>

      <div class="col-md-12 col-lg-6 col-xl-4" v-if="selectedNode.isValidator">
        <history-card
          :subject="'Validating'"
          :entityId="selectedNode.publicKey"
          :fetchDayMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getDayStatistics(publicKey, from, to)
          "
          :fetchMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getStatistics(publicKey, from, to)
          "
          :dayMeasurementProperty="'isValidatingCount'"
          :measurementProperty="'isValidating'"
          :chartType="'bar'"
        >
        </history-card>
      </div>
      <div v-else class="col-md-12 col-lg-6 col-xl-4">
        <history-card
          :subject="'Active'"
          :entityId="selectedNode.publicKey"
          :fetchDayMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getDayStatistics(publicKey, from, to)
          "
          :fetchMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getStatistics(publicKey, from, to)
          "
          :dayMeasurementProperty="'isActiveCount'"
          :measurementProperty="'isActive'"
          :chartType="'bar'"
        >
        </history-card>
      </div>

      <div class="col-md-12 col-lg-6 col-xl-4" v-if="selectedNode.isValidator">
        <history-card
          :subject="'History Archive up-to-date'"
          :entityId="selectedNode.publicKey"
          :fetchDayMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getDayStatistics(publicKey, from, to)
          "
          :fetchMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getStatistics(publicKey, from, to)
          "
          :dayMeasurementProperty="'isFullValidatorCount'"
          :measurementProperty="'isFullValidator'"
        >
        </history-card>
      </div>
      <div class="col-md-12 col-lg-6 col-xl-4" v-if="selectedNode.isValidator">
        <history-card
          :subject="'Overloaded'"
          :entityId="selectedNode.publicKey"
          :fetchDayMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getDayStatistics(publicKey, from, to)
          "
          :fetchMeasurements="
            (publicKey, from, to) =>
              nodeMeasurementStore.getStatistics(publicKey, from, to)
          "
          :dayMeasurementProperty="'isOverloadedCount'"
          :measurementProperty="'isOverLoaded'"
          :inverted="true"
        >
        </history-card>
      </div>

      <div class="col-md-12 col-lg-6 col-xl-4">
        <node-info :node="selectedNode" />
      </div>
      <div class="col-md-12 col-lg-6 col-xl-4">
        <node-extra-info :node="selectedNode" />
      </div>

      <div v-if="selectedNode.isValidator" class="col-md-12 col-lg-6 col-xl-4">
        <node-trusted-by :node="selectedNode" />
      </div>
    </div>
    <div class="row row-cards">
      <div class="col-lg-12 col-xl-12" v-if="selectedNode.isValidator">
        <node-quorum-set-validators :node="selectedNode" />
      </div>
      <div class="col-lg-12 col-xl-12" v-if="!store.isSimulation">
        <node-latest-updates :node="selectedNode" />
      </div>
      <div v-else class="col-lg-12 col-xl-12">
        <node-trusted-by :node="selectedNode" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HistoryCard from "@/components/charts/history-card.vue";
import NodeInfo from "@/components/node/node-cards/node-info.vue";
import NodeExtraInfo from "@/components/node/node-cards/node-extra-info.vue";
import NodeQuorumSetValidators from "@/components/node/node-cards/node-quorum-set-validators.vue";
import NodeIndex from "@/components/node/node-cards/statistics/node-index.vue";
import NodeStatistics24HActive from "@/components/node/node-cards/statistics/node-statistics-24H-active.vue";
import NodeTrustedBy from "@/components/node/node-cards/node-trusted-by.vue";
import NodeLatestUpdates from "@/components/node/node-cards/node-latest-updates.vue";
import { BAlert } from "bootstrap-vue";
import { HistoryArchiveScan } from "@stellarbeat/js-stellarbeat-shared";
import useStore from "@/store/useStore";
import NodeStatistics30DOverloaded from "@/components/node/node-cards/statistics/node-statistics-30D-overloaded.vue";
import NodeStatistics30DActive from "@/components/node/node-cards/statistics/node-statistics-30D-active.vue";
import NodeStatistics30DValidating from "@/components/node/node-cards/statistics/node-statistics-30D-validating.vue";
import NodeStatistics24HValidating from "@/components/node/node-cards/statistics/node-statistics-24H-validating.vue";
import useNodeMeasurementsStore from "@/store/useNodeMeasurementsStore";
import useHistoryArchiveScanRepository from "@/repositories/useHistoryArchiveScanRepository";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

const store = useStore();
const historyArchiveScanRepository = useHistoryArchiveScanRepository();
const nodeMeasurementStore = useNodeMeasurementsStore();
const network = store.network;
const selectedNode = computed(() => store.selectedNode);

const fetchingLatestHistoryArchiveScan = ref(false);
const historyArchiveScan = ref<HistoryArchiveScan | null>(null);

async function fetchHistoryArchiveScan() {
  if (!selectedNode.value) return;

  if (!selectedNode.value.historyUrl) return;

  fetchingLatestHistoryArchiveScan.value = true;
  historyArchiveScan.value = await historyArchiveScanRepository.findLatest(
    selectedNode.value.historyUrl
  );

  fetchingLatestHistoryArchiveScan.value = false;
}

const historyArchiveErrorDescription = computed(() => {
  if (historyArchiveScan.value === null)
    return "Verification error in history archive detected. Repair ";

  let message = `Archive verification error at <a href=${historyArchiveScan.value.errorUrl} target="_blank">${historyArchiveScan.value.errorUrl}</a>: ${historyArchiveScan.value.errorMessage}. `;

  message +=
    "Start repair at ledger " + historyArchiveScan.value.latestVerifiedLedger;

  return message;
});

watch(
  selectedNode,
  () => {
    if (selectedNode.value && selectedNode.value.historyUrl)
      fetchHistoryArchiveScan();
  },
  { immediate: true }
);
</script>
