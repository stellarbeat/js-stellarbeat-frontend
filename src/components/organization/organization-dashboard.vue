<template>
    <div v-if="organization">
        <div class="row row-cards row-deck">
            <div class="col-md-12 col-lg-6 col-xl-4">
                <organization-profile :organization="organization"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <organization-statistics-subquorum-24h-availability :organization="organization"/>
                <organization-statistics-subquorum-30-d-availability :organization="organization"/>
            </div>
            <div class="col-md-12 col-lg-12 col-xl-4">
                <history-card
                        :subject="'Availability history'"
                        :entityId="organization.id"
                        :fetchDayMeasurements="(organizationId, from, to) => store.organizationMeasurementStore.getDayStatistics(organizationId, from, to)"
                        :fetchMeasurements="(organizationId, from, to) => store.organizationMeasurementStore.getStatistics(organizationId, from, to)"
                        :dayMeasurementProperty="'isSubQuorumAvailableCount'"
                        :measurementProperty="'isSubQuorumAvailable'"
                >
                </history-card>
            </div>
        </div>
        <div class="row row-cards">
            <div class="col-lg-12 col-xl-12">
                <organization-validators :organization="organization"/>
            </div>
            <div class="col-lg-12 col-xl-12">
                <organization-latest-updates :organization="organization"/>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import NodesCountryDistribution from '@/components/network/cards/nodes-country-distribution.vue';
    import NodesVersions from '@/components/network/cards/nodes-versions.vue';
    import ValidatorsServerLoad from '@/components/network/cards/validator-load.vue';
    import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import HistoryCard from '@/components/charts/history-card.vue';
    import OrganizationProfile from '@/components/organization/organization-cards/organization-profile.vue';
    import OrganizationValidators from '@/components/organization/organization-cards/organization-validators.vue';
    import OrganizationStatisticsSubquorum24hAvailability
        from '@/components/organization/organization-cards/statistics/organization-statistics-subquorum-24h-availability.vue';
    import OrganizationStatisticsSubquorum30DAvailability
        from '@/components/organization/organization-cards/statistics/organization-statistics-subquorum-30D-availability.vue';
    import OrganizationLatestUpdates
        from '@/components/organization/organization-cards/organization-latest-updates.vue';

    @Component({
        components: {
            OrganizationLatestUpdates,
            OrganizationStatisticsSubquorum30DAvailability,
            OrganizationStatisticsSubquorum24hAvailability,
            OrganizationValidators,
            OrganizationProfile,
            HistoryCard, ValidatorsServerLoad, NodesVersions, NodesCountryDistribution}
    })

    export default class OrganizationDashboard extends Vue {

        get validators(): (Node | any)[] {
            return this.organization.validators
                .map(publicKey => this.network.getNodeByPublicKey(publicKey)!)
                .sort((a: Node, b: Node) => a.displayName.localeCompare(b.displayName));
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get organization(): Organization {
            return this.store.selectedOrganization!;
        }

        get network(): Network {
            return this.store.network;
        }

        get failAt() {
            let nrOfValidatingNodes = this.organization.validators
                .map(validator => this.network.getNodeByPublicKey(validator)!)
                .filter(node => node.isValidating).length;

            return nrOfValidatingNodes - this.organization.subQuorumThreshold + 1;
        }
    }
</script>
