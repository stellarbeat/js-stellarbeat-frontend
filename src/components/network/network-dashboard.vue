<template>
    <div>
        <div class="row">
            <div class="col-12">
                <network-statistics :network="network"/>
            </div>
        </div>
        <div class="row row-cards row-deck">
            <div class="col-lg-12 col-xl-8">
                <div class="row row-cards row-deck">
                    <div class="col-lg-6 col-xl-6">
                        <NodesCountryDistribution/>
                    </div>
                    <div class="col-lg-6 col-xl-6">
                        <ValidatorsServerLoad/>
                    </div>
                </div>
                <div class="row row-cards row-deck">
                    <div class="col-lg-6 col-xl-6">
                        <NodesVersions/>
                    </div>
                    <div class="col-lg-6 col-xl-6">
                        <network-organizations/>
                    </div>
                </div>
            </div>

            <div class="col-xl-4 col-lg-12">
                <network-nodes/>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <QuorumSetConnections/>
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
    import {Network} from '@stellarbeat/js-stellar-domain';
    import NetworkStatistics from '@/components/network/cards/network-statistics.vue';
    import NetworkNodes from '@/components/network/cards/network-nodes.vue';
    import NetworkOrganizations from '@/components/network/cards/network-organizations.vue';

    @Component({
        components: {
            NetworkOrganizations,
            NetworkNodes,
            NetworkStatistics, QuorumSetConnections, ValidatorsServerLoad, NodesVersions, NodesCountryDistribution
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