<template>
  <div class="card">
    <div class="card-body d-flex flex-row flex-wrap align-items-center p-3">
      <gauge
        width="65px"
        height="65px"
        :value="organization.subQuorum24HoursAvailability"
        :max-value="100"
        value-color="#5eba00"
        negative-value-color="#cd201f"
        class="mr-3"
      />
      <div class="lh-sm">
        <div class="strong">
          {{ +organization.subQuorum24HoursAvailability.toFixed(2) }}%
        </div>
        <div class="text-muted">
          24H Availability
          <b-icon-info-circle
            class="text-gray"
            v-b-tooltip:hover="
              'Availability: more than or equal to 50% of the organization validators are validating.'
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop } from "vue-property-decorator";
import Vue from "vue";
import { Network, Organization } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import Gauge from "@/components/charts/gauge.vue";
import { VBTooltip, BIconInfoCircle } from "bootstrap-vue";

@Component({
  components: { Gauge, BIconInfoCircle },
  directives: { "b-tooltip": VBTooltip },
})
export default class OrganizationStatistics24HSubQuorumAvailability extends Vue {
  @Prop()
  protected organization!: Organization;

  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }
}
</script>

<style scoped>
.strong {
  font-weight: 500;
}
.text-muted {
  color: #6e7582 !important;
}
</style>
