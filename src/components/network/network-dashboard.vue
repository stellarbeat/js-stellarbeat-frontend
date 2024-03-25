<template>
  <div>
    <b-alert :show="store.networkAnalyzer.manualMode" variant="warning">
      Network not fully analyzed because top tier is not symmetric or too large
      to analyze in a reasonable timeframe. <br />
      You can run the
      <a href="#" @click.prevent.stop="store.isNetworkAnalysisVisible = true"
        >network analysis</a
      >
      manually.
    </b-alert>
    <b-alert :show="store.networkHasDangers()" variant="danger">
      {{ store.getNetworkDangers().description }}
      <br />
      See
      <a href="#" @click.prevent.stop="store.isNetworkAnalysisVisible = true"
        >network analysis</a
      >
      for details.
    </b-alert>
    <b-alert :show="store.networkHasWarnings()" variant="warning">
      {{ store.getNetworkWarnings().description }}
      <br />
      See
      <a href="#" @click.prevent.stop="store.isNetworkAnalysisVisible = true"
        >network analysis</a
      >
      for details.
    </b-alert>
    <div class="row row-cards row-deck">
      <div class="col-12">
        <network-statistics :network="network" />
      </div>
    </div>
    <div class="row row-cards row-deck gauges">
      <div v-if="!store.isSimulation" class="col-lg-4 col-xl-4">
        <NodesCountryDistribution />
      </div>

      <div v-if="!store.isSimulation" class="col-lg-4 col-xl-4">
        <NodesVersions />
      </div>
      <div v-if="!store.isSimulation" class="col-lg-4 col-xl-4">
        <ValidatorLoad />
      </div>
    </div>
    <div class="row row-cards row-deck">
      <div v-if="!store.networkAnalyzer.manualMode" class="col-lg-6">
        <NetworkRiskRadarChart />
      </div>
      <div
        v-if="!store.isSimulation && store.networkContext.enableHistory"
        class="col-lg-6"
      >
        <NetworkAnalysis analysis-type="safety">
          <template #info>
            <safety-info />
          </template>
        </NetworkAnalysis>
      </div>
      <div
        v-if="!store.isSimulation && store.networkContext.enableHistory"
        class="col-lg-12"
      >
        <NetworkAnalysis analysis-type="liveness" default-bucket-size="30D">
          <template #info>
            <liveness-info />
          </template>
        </NetworkAnalysis>
      </div>

      <div v-if="network.organizations.length > 0" class="col-lg-6 col-xl-6">
        <network-organizations />
      </div>

      <div class="col-lg-6 col-xl-6">
        <network-nodes />
      </div>

      <div
        v-if="
          network.organizations.length > 0 &&
          !store.isSimulation &&
          store.networkContext.enableHistory
        "
        class="col-lg-6 col-xl-6"
      >
        <network-organization-updates />
      </div>

      <div
        v-if="!store.isSimulation && store.networkContext.enableHistory"
        class="col-lg-6 col-xl-6"
      >
        <network-validator-updates />
      </div>

      <div
        v-if="!store.isSimulation && store.networkContext.enableHorizon"
        when-visible
      >
        <div class="col-lg-6 col-12">
          <network-horizon />
        </div>
      </div>
      <div class="col-lg-6 col-12">
        <network-isps />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import NodesCountryDistribution from "@/components/network/cards/nodes-country-distribution.vue";
import NodesVersions from "@/components/network/cards/nodes-versions.vue";
import NetworkStatistics from "@/components/network/cards/network-statistics/network-statistics.vue";
import NetworkNodes from "@/components/network/cards/network-nodes.vue";
import NetworkOrganizations from "@/components/network/cards/network-organizations.vue";
import NetworkAnalysis from "@/components/network/cards/network-risk-analysis-charts/network-analysis.vue";
import { BAlert } from "bootstrap-vue";
import LivenessInfo from "@/components/network/cards/network-risk-analysis-charts/liveness-info.vue";
import SafetyInfo from "@/components/network/cards/network-risk-analysis-charts/safety-info.vue";
import NetworkValidatorUpdates from "@/components/network/cards/network-validator-updates.vue";
import NetworkOrganizationUpdates from "@/components/network/cards/network-organization-updates.vue";
import NetworkHorizon from "@/components/network/cards/network-horizon.vue";
import NetworkRiskRadarChart from "@/components/network/cards/network-risk-analysis-charts/network-risk-radar-chart.vue";
import useStore from "@/store/useStore";
import ValidatorLoad from "@/components/network/cards/validator-load.vue";
import NetworkIsps from "@/components/network/cards/network-isps.vue";

const store = useStore();
const network = store.network;
</script>
<style scoped></style>
