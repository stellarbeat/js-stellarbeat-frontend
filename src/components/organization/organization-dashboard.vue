<template>
    <div>
        <div class="row row-cards row-deck">
            <div class="col-sm-12 col-xl-4">
                <organization-profile :organization="organization"/>
            </div>
            <div class="col-sm-12 col-xl-4">
                <organization-subquorum-availability :fail-at="failAt" :organization="organization"/>
            </div>
            <div class="col-sm-12 col-xl-4">
                <history-card
                        :subject="'Subquorum Availability history'"
                        :entityId="organization.id"
                        :fetchDayMeasurements="(organizationId, from, to) => store.organizationMeasurementStore.getDayMeasurements(organizationId, from, to)"
                        :fetchMeasurements="(organizationId, from, to) => store.organizationMeasurementStore.getMeasurements(organizationId, from, to)"
                        :dayMeasurementProperty="'isSubQuorumAvailableCount'"
                        :measurementProperty="'isSubQuorumAvailable'"
                >
                </history-card>
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
    import QuorumSetConnections from '@/components/network/cards/quorum-set-connections/quorum-set-connections.vue';
    import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import HistoryCard from '@/components/charts/history-card.vue';
    import OrganizationProfile from '@/components/organization/organization-cards/organization-profile.vue';
    import OrganizationSubquorumAvailability from '@/components/organization/organization-cards/organization-subquorum-availability.vue';

    @Component({
        components: {
            OrganizationSubquorumAvailability,
            OrganizationProfile,
            HistoryCard, QuorumSetConnections, ValidatorsServerLoad, NodesVersions, NodesCountryDistribution}
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
