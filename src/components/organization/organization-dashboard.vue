<template>
  <div>
    <div v-if="organization">
      <b-alert
        :show="network.isOrganizationFailing(organization)"
        variant="danger"
      >
        {{ store.getOrganizationFailingReason(organization) }}
      </b-alert>
      <b-alert
        :show="
          OrganizationWarningDetector.organizationHasWarnings(
            organization,
            store.network,
          )
        "
        variant="warning"
      >
        <strong>Detected warning(s)</strong>
        <ul class="pl-3 ml-0">
          <li
            v-bind:key="reason"
            v-for="reason in OrganizationWarningDetector.getOrganizationWarningReasons(
              organization,
              network,
            )"
          >
            {{ reason }}.
          </li>
        </ul>
      </b-alert>
      <div class="row row-cards row-deck" v-if="!store.isSimulation">
        <div class="col-12">
          <organization-profile :organization="organization" />
        </div>
        <div class="col-md-12 col-lg-6" v-if="!store.isSimulation">
          <OrganizationStatisticsSubQuorum24hAvailability
            :organization="organization"
          />
          <OrganizationStatisticsSubQuorum30DAvailability
            :organization="organization"
          />
        </div>
        <div class="col-md-12 col-lg-6" v-if="!store.isSimulation">
          <history-card
            :subject="'Availability history'"
            :entityId="organization.id"
            :fetchDayMeasurements="
              (organizationId, from, to) =>
                organizationMeasurementStore.getDayStatistics(
                  organizationId,
                  from,
                  to,
                )
            "
            :fetchMeasurements="
              (organizationId, from, to) =>
                organizationMeasurementStore.getStatistics(
                  organizationId,
                  from,
                  to,
                )
            "
            :dayMeasurementProperty="'isSubQuorumAvailableCount'"
            :measurementProperty="'isSubQuorumAvailable'"
          >
          </history-card>
        </div>
      </div>

      <div class="row row-cards">
        <div class="col-lg-12 col-xl-12">
          <organization-validators :organization="organization" />
        </div>
      </div>
      <div class="row row-cards" v-if="!store.isSimulation">
        <div class="col-lg-12 col-xl-12" v-if="!store.isSimulation">
          <organization-latest-updates :organization="organization" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import HistoryCard from "@/components/charts/history-card.vue";
import OrganizationProfile from "@/components/organization/organization-cards/organization-profile.vue";
import OrganizationValidators from "@/components/organization/organization-cards/organization-validators.vue";
import OrganizationStatisticsSubQuorum24hAvailability from "@/components/organization/organization-cards/statistics/organization-statistics-subquorum-24h-availability.vue";
import OrganizationStatisticsSubQuorum30DAvailability from "@/components/organization/organization-cards/statistics/organization-statistics-subquorum-30D-availability.vue";
import OrganizationLatestUpdates from "@/components/organization/organization-cards/organization-latest-updates.vue";
import { BAlert } from "bootstrap-vue";
import useStore from "@/store/useStore";
import useOrganizationMeasurementsStore from "@/store/useOrganizationMeasurementsStore";
import { OrganizationWarningDetector } from "@/services/OrganizationWarningDetector";

const store = useStore();
const organizationMeasurementStore = useOrganizationMeasurementsStore();
const network = store.network;

const organization = computed(() => {
  if (!store.selectedOrganization) throw new Error("No organization selected");
  return store.selectedOrganization;
});
</script>
