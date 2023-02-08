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
        :show="store.organizationHasWarnings(organization)"
        variant="warning"
      >
        {{ store.getOrganizationWarningReason(organization) }}
      </b-alert>
      <div class="row row-cards row-deck" v-if="!store.isSimulation">
        <LazyHydrate when-visible>
          <div class="col-12">
            <organization-profile :organization="organization" />
          </div>
        </LazyHydrate>
        <LazyHydrate when-visible>
          <div class="col-md-12 col-lg-6" v-if="!store.isSimulation">
            <OrganizationStatisticsSubQuorum24hAvailability
              :organization="organization"
            />
            <OrganizationStatisticsSubQuorum30DAvailability
              :organization="organization"
            />
          </div>
        </LazyHydrate>
        <LazyHydrate when-visible>
          <div class="col-md-12 col-lg-6" v-if="!store.isSimulation">
            <history-card
              :subject="'Availability history'"
              :entityId="organization.id"
              :fetchDayMeasurements="
                (organizationId, from, to) =>
                  store.organizationMeasurementStore.getDayStatistics(
                    organizationId,
                    from,
                    to
                  )
              "
              :fetchMeasurements="
                (organizationId, from, to) =>
                  store.organizationMeasurementStore.getStatistics(
                    organizationId,
                    from,
                    to
                  )
              "
              :dayMeasurementProperty="'isSubQuorumAvailableCount'"
              :measurementProperty="'isSubQuorumAvailable'"
            >
            </history-card>
          </div>
        </LazyHydrate>
      </div>

      <div class="row row-cards">
        <LazyHydrate when-visible>
          <div class="col-lg-12 col-xl-12">
            <organization-validators :organization="organization" />
          </div>
        </LazyHydrate>
      </div>
      <div class="row row-cards" v-if="!store.isSimulation">
        <LazyHydrate when-visible>
          <div class="col-lg-12 col-xl-12" v-if="!store.isSimulation">
            <organization-latest-updates :organization="organization" />
          </div>
        </LazyHydrate>
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
import LazyHydrate from "vue-lazy-hydration";
import { BAlert } from "bootstrap-vue";
import useStore from "@/store/useStore";

const store = useStore();
const network = store.network;

const organization = computed(() => {
  if (!store.selectedOrganization) throw new Error("No organization selected");
  return store.selectedOrganization;
});
</script>
