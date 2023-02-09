<template>
  <div>
    <div>
      <div class="page-header d-flex justify-content-between">
        <div class="d-flex align-items-center">
          <h1 class="page-title">Nodes</h1>
          <simulation-badge />
          <time-travel-badge />
        </div>
        <crawl-time class="" />
      </div>
      <div class="card mb-2 p-1">
        <div class="card-header">
          <div class="row header-row">
            <div class="col-12 col-sm-6">
              <div class="row">
                <div class="col-sm-6">
                  <label class="custom-switch mt-2">
                    <input
                      name="custom-switch-checkbox"
                      class="custom-switch-input"
                      type="checkbox"
                      v-model="optionShowInactive"
                    />
                    <span class="custom-switch-indicator"></span>
                    <span class="custom-switch-description"
                      >Include inactive nodes</span
                    >
                  </label>
                </div>
                <div class="col-sm-6">
                  <label class="custom-switch mt-2">
                    <input
                      name="custom-switch-checkbox"
                      class="custom-switch-input"
                      type="checkbox"
                      v-model="optionShowWatchers"
                    />
                    <span class="custom-switch-indicator"></span>
                    <span class="custom-switch-description"
                      >Include watcher nodes</span
                    >
                  </label>
                </div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <b-form-input
                class="form-control search mr-0"
                type="text"
                v-model="filter"
                id="searchInput"
                placeholder="Type public key, name, ... to search"
              />
            </div>
          </div>
        </div>
        <div class="card-body">
          <nodes-table :fields="fields" :nodes="nodes" :filter="filter" />
        </div>
      </div>
      <div class="card mb-2" v-if="store.networkContext.enableIndex">
        <div class="card-body">
          <div class="text-wrap">
            <h2 class="mt-0 mb-4">Index formula</h2>
            <pre><code>
Index = (TypeIndex + ActiveIndex + ValidationIndex + VersionIndex + TrustIndex + AgeIndex)/6

TypeIndex = Full validator | Basic validator | Watcher node
ActiveIndex = Active percentage last 30 days
ValidationIndex = Validation percentage last 30 days
Version = How far away from the latest stable Stellar core version
Trust = How many active validators trust this node
Age = Time since discovery
                        </code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Node } from "@stellarbeat/js-stellarbeat-shared";
import CrawlTime from "@/components/crawl-time.vue";
import SimulationBadge from "@/components/simulation-badge.vue";
import NodesTable from "@/components/node/nodes-table.vue";
import TimeTravelBadge from "@/components/time-travel-badge.vue";
import { BFormInput } from "bootstrap-vue";
import { computed, ref } from "vue";
import useStore from "@/store/useStore";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
});

const store = useStore();

const optionShowInactive = ref(false);
const optionShowWatchers = ref(false);
const filter = ref("");

const fieldsBase = [
  { key: "name", sortable: true },
  { key: "organization", sortable: true },
  { key: "country", sortable: true },
  { key: "isp", sortable: true },
  { key: "type", label: "type", sortable: true },
  { key: "ip", sortable: true },
  { key: "version", sortable: true },
  { key: "validating", sortable: true },
];

if (!store.isSimulation) {
  if (store.networkContext.enableHistory) {
    fieldsBase.push({
      key: "active24Hour",
      label: "24H active",
      sortable: true,
    });
    fieldsBase.push({
      key: "active30Days",
      label: "30D active",
      sortable: true,
    });
    fieldsBase.push({
      key: "validating24Hour",
      label: "24H validating",
      sortable: true,
    });
    fieldsBase.push({
      key: "validating30Days",
      label: "30D validating",
      sortable: true,
    });
    fieldsBase.push({
      key: "overLoaded24Hour",
      label: "24H overloaded",
      sortable: true,
    });
  }

  if (store.networkContext.enableIndex) {
    fieldsBase.push({ key: "index", label: "index", sortable: true });
  }
}

const fields = computed(() => {
  return fieldsBase;
});

const getNodeType = (node: Node): string => {
  if (node.isFullValidator) {
    return "Full validator";
  }
  if (node.isValidator) return "Validator";

  return "Watcher";
};

const nodes = computed(() => {
  return store.network.nodes
    .filter((node) => node.active || optionShowInactive.value)
    .filter((node) => node.isValidator || optionShowWatchers.value)
    .map((node) => {
      return {
        name: node.displayName,
        type: getNodeType(node),
        active24Hour: node.statistics.has24HourStats
          ? node.statistics.active24HoursPercentage + "%"
          : "NA",
        active30Days: node.statistics.has30DayStats
          ? node.statistics.active30DaysPercentage + "%"
          : "NA",
        validating24Hour: node.statistics.has24HourStats
          ? node.statistics.validating24HoursPercentage + "%"
          : "NA",
        validating30Days: node.statistics.has30DayStats
          ? node.statistics.validating30DaysPercentage + "%"
          : "NA",
        overLoaded24Hour: node.statistics.has24HourStats
          ? node.statistics.overLoaded24HoursPercentage + "%"
          : "NA",
        ip: node.key,
        publicKey: node.publicKey,
        country: node.geoData.countryName,
        isp: node.isp,
        version: node.versionStr,
        isFullValidator: node.isFullValidator,
        isValidator: node.isValidator,
        index: node.index,
        validating: node.isValidating,
        organization: getOrganization(node),
        organizationId: node.organizationId,
      };
    });
});

const getOrganization = (node: Node) => {
  if (!node.organizationId) {
    return "-";
  }
  let organization = store.network.getOrganizationById(node.organizationId);
  if (organization) {
    return organization.name;
  } else {
    return "-";
  }
};
</script>

<script lang="ts">
export default {
  metaInfo: {
    title: "Nodes overview - Stellarbeat.io",
    meta: [
      {
        name: "description",
        content: "Search through all available nodes",
      },
    ],
  },
};
</script>
<style scoped>
.header-row {
  width: 100%;
}
</style>
