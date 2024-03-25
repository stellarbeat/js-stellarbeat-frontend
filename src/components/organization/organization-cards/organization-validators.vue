<template>
  <div class="card">
    <nodes-table :nodes="validators" :fields="fields" />
  </div>
</template>
<script setup lang="ts">
import { computed, ComputedRef } from "vue";
import { Organization } from "@stellarbeat/js-stellarbeat-shared";
import NodesTable, { TableNode } from "@/components/node/nodes-table.vue";
import useStore from "@/store/useStore";

const props = defineProps<{
  organization: Organization;
}>();

const store = useStore();

const fields = computed(() => {
  const fields = [{ key: "name", label: "Validator" }, "country", "isp"];
  if (!store.isSimulation) {
    fields.push(
      "index",
      { key: "validating24Hour", label: "24H validating" },
      { key: "validating30Days", label: "30D validating" },
      "version",
    );
  }
  return fields;
});

const validators: ComputedRef<TableNode[]> = computed(() => {
  return props.organization.validators
    .map((publicKey) => store.network.getNodeByPublicKey(publicKey))
    .map((validator) => {
      return {
        isFullValidator: validator.isFullValidator,
        name: validator.displayName,
        version: validator.versionStr,
        index: validator.index,
        validating24Hour: validator.statistics.has24HourStats
          ? validator.statistics.validating24HoursPercentage + "%"
          : "NA",
        validating30Days: validator.statistics.has30DayStats
          ? validator.statistics.validating30DaysPercentage + "%"
          : "NA",
        country: validator.geoData.countryName,
        isp: validator.isp,
        publicKey: validator.publicKey,
      };
    });
});
</script>
