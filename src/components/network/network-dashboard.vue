<template>
    <div>
        <div class="row row-cards row-deck">
            <div class="col-12">
                <network-statistics :network="network"/>
            </div>
            <div class="col-lg-4 col-xl-4">
                <NodesCountryDistribution/>
            </div>
            <div class="col-lg-4 col-xl-4">
                <NodesVersions/>
            </div>
            <div class="col-lg-4 col-xl-4">
                <ValidatorsServerLoad/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <NetworkAnalysis analysis-type="liveness" default-bucket-size="30D">
                    <template v-slot:info>
                        <liveness-info/>
                    </template>
                </NetworkAnalysis>
            </div>
            <div class="col-lg-6 col-xl-6">
                <NetworkAnalysis analysis-type="safety">
                    <template v-slot:info>
                        <safety-info/>
                    </template>
                </NetworkAnalysis>
            </div>
            <div v-if="network.organizations.length > 0" class="col-lg-6 col-xl-6">
                <network-organizations/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <network-nodes/>
            </div>
            <div v-if="network.organizations.length > 0" class="col-lg-6 col-xl-6">
                <network-organization-updates/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <network-validator-updates/>
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
    import {Network} from '@stellarbeat/js-stellar-domain';
    import NetworkStatistics from '@/components/network/cards/network-statistics/network-statistics.vue';
    import NetworkNodes from '@/components/network/cards/network-nodes.vue';
    import NetworkOrganizations from '@/components/network/cards/network-organizations.vue';
    import NetworkAnalysis from '@/components/network/cards/network-risk-analysis-charts/network-analysis.vue';
    import {BCard, BListGroup, BListGroupItem, BBadge} from 'bootstrap-vue';
    import LivenessInfo from '@/components/network/cards/network-risk-analysis-charts/liveness-info.vue';
    import SafetyInfo from '@/components/network/cards/network-risk-analysis-charts/safety-info.vue';
    import NetworkValidatorUpdates from '@/components/network/cards/network-validator-updates.vue';
    import NetworkOrganizationUpdates from '@/components/network/cards/network-organization-updates.vue';

    @Component({
        components: {
            NetworkOrganizationUpdates,
            NetworkValidatorUpdates,
            SafetyInfo,
            LivenessInfo,
            NetworkAnalysis,
            NetworkOrganizations,
            NetworkNodes,
            NetworkStatistics,
            ValidatorsServerLoad,
            NodesVersions,
            NodesCountryDistribution,
            BCard,
            BListGroup,
            BListGroupItem,
            BBadge
        }
    })

    export default class NetworkDashboard extends Vue {
        get network(): Network {
            return this.$root.$data.store.network;
        }
    }
</script>
<style scoped>

</style>