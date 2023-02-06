<template>
  <div>
    <b-alert :show="store.networkAnalyzer.manualMode" variant="warning">
      Network not fully analyzed because top tier is not symmetric or too large
      to analyze in a reasonable timeframe. <br />
      You can run the
      <a
        href="#"
        v-on:click.prevent.stop="store.isNetworkAnalysisVisible = true"
        >network analysis</a
      >
      manually.
    </b-alert>
    <b-alert :show="store.networkHasDangers()" variant="danger">
      {{ store.getNetworkDangers().description }}
      <br />
      See
      <a
        href="#"
        v-on:click.prevent.stop="store.isNetworkAnalysisVisible = true"
        >network analysis</a
      >
      for details.
    </b-alert>
    <b-alert :show="store.networkHasWarnings()" variant="warning">
      {{ store.getNetworkWarnings().description }}
      <br />
      See
      <a
        href="#"
        v-on:click.prevent.stop="store.isNetworkAnalysisVisible = true"
        >network analysis</a
      >
      for details.
    </b-alert>
    <div class="row row-cards row-deck">
      <LazyHydrate when-visible>
        <div class="col-12">
          <network-statistics :network="network" />
        </div>
      </LazyHydrate>
    </div>
    <div class="row row-cards row-deck gauges">
      <LazyHydrate when-visible>
        <div class="col-lg-6 col-xl-6" v-if="!store.isSimulation">
          <NodesCountryDistribution />
        </div>
      </LazyHydrate>

      <LazyHydrate when-visible>
        <div class="col-lg-6 col-xl-6" v-if="!store.isSimulation">
          <NodesVersions />
        </div>
      </LazyHydrate>
    </div>
    <div class="row row-cards row-deck">
      <LazyHydrate when-visible>
        <div class="col-lg-6" v-if="!store.networkAnalyzer.manualMode">
          <NetworkRiskRadarChart />
        </div>
      </LazyHydrate>
      <LazyHydrate when-visible>
        <div
          class="col-lg-6"
          v-if="!store.isSimulation && store.networkContext.enableHistory"
        >
          <NetworkAnalysis analysis-type="safety">
            <template v-slot:info>
              <safety-info />
            </template>
          </NetworkAnalysis>
        </div>
      </LazyHydrate>
      <LazyHydrate when-visible>
        <div
          class="col-lg-12"
          v-if="!store.isSimulation && store.networkContext.enableHistory"
        >
          <NetworkAnalysis analysis-type="liveness" default-bucket-size="30D">
            <template v-slot:info>
              <liveness-info />
            </template>
          </NetworkAnalysis>
        </div>
      </LazyHydrate>

      <LazyHydrate when-visible>
        <div v-if="network.organizations.length > 0" class="col-lg-6 col-xl-6">
          <network-organizations />
        </div>
      </LazyHydrate>

      <LazyHydrate when-visible>
        <div class="col-lg-6 col-xl-6">
          <network-nodes />
        </div>
      </LazyHydrate>

      <LazyHydrate when-visible>
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
      </LazyHydrate>

      <LazyHydrate when-visible>
        <div
          class="col-lg-6 col-xl-6"
          v-if="!store.isSimulation && store.networkContext.enableHistory"
        >
          <network-validator-updates />
        </div>
      </LazyHydrate>

      <LazyHydrate
        when-visible
        v-if="!store.isSimulation && store.networkContext.enableHorizon"
      >
        <div class="col-lg-6 col-12">
          <network-horizon />
        </div>
      </LazyHydrate>
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
import LazyHydrate from "vue-lazy-hydration";
import NetworkHorizon from "@/components/network/cards/network-horizon.vue";
import NetworkRiskRadarChart from "@/components/network/cards/network-risk-analysis-charts/network-risk-radar-chart.vue";
import useStore from "@/store/useStore";

const store = useStore();
const network = store.network;
</script>
<style scoped></style>
