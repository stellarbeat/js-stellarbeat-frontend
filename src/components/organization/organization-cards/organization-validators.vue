<template>
  <div class="card">
    <nodes-table :nodes="validators" :fields="fields" />
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Network, Organization } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import NodesTable from "@/components/node/nodes-table.vue";
import useStore from "@/store/useStore";

@Component({
  components: { NodesTable },
})
export default class OrganizationValidators extends Vue {
  @Prop()
  organization!: Organization;
  get fields() {
    let fields = [{ key: "name", label: "Validator" }, "country", "isp"];
    if (!this.store.isSimulation) {
      fields.push(
        "index",
        { key: "validating24Hour", label: "24H validating" },
        { key: "validating30Days", label: "30D validating" },
        "version"
      );
    }
    return fields;
  }

  get store(): Store {
    return useStore();
  }

  get network(): Network {
    return this.store.network;
  }

  get validators() {
    return this.organization.validators
      .map((publicKey) => this.network.getNodeByPublicKey(publicKey))
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
  }
}
</script>
