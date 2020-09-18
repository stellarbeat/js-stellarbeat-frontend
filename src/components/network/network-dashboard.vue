<template>
    <div>
        <div class="row">
            <!--div class="col-12">
                <b-card>
                    <dl>
                        <dt>Quorum intersection: </dt>
                        <dd>
                            <b-badge v-if="network.networkStatistics.hasQuorumIntersection" pill variant="success">Yes</b-badge>
                            <b-badge v-else pill variant="danger">No</b-badge>
                        </dd>
                        <dt>Safety risk analysis: </dt>
                        <dd>Set(s) of {{network.networkStatistics.minSplittingSetSize}} nodes across {{network.networkStatistics.minSplittingSetOrgsSize}} organizations founds that could impact safety</dd>
                        <dt>Quorum availability: </dt>
                        <dd>
                            <b-badge v-if="network.networkStatistics.minBlockingSetFilteredSize > 0" pill variant="success">Yes</b-badge>
                            <b-badge v-else pill variant="danger">No</b-badge>
                        </dd>
                        <dt>Transitive quorumset availability: </dt>
                        <dd>
                            <b-badge v-if="network.networkStatistics.transitiveQuorumSetSize > 0" pill variant="success">Yes</b-badge>
                            <b-badge v-else pill variant="danger">No</b-badge>
                        </dd>
                        <dt>Liveness risk analysis: </dt>
                        <dd>Set(s) of {{network.networkStatistics.minBlockingSetFilteredSize}} nodes across {{network.networkStatistics.minBlockingSetOrgsFilteredSize}} organizations founds that could impact liveness</dd>
                    </dl>
                </b-card>
            </div!-->
        </div>
        <div class="row row-cards row-deck">
            <div class="col-lg-4 col-xl-4">
                <NodesCountryDistribution/>
            </div>
            <div class="col-lg-4 col-xl-4">
                <NodesVersions/>
            </div>
            <div class="col-lg-4 col-xl-4">
                <ValidatorsServerLoad/>
            </div>
            <div class="col-12">
                <network-statistics :network="network"/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <NetworkAnalysis analysis-type="liveness"/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <NetworkAnalysis analysis-type="safety"/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <network-organizations/>
            </div>
            <div class="col-lg-6 col-xl-6">
                <network-nodes/>
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
    import NetworkStatistics from '@/components/network/cards/network-statistics/network-statistics.vue';
    import NetworkNodes from '@/components/network/cards/network-nodes.vue';
    import NetworkOrganizations from '@/components/network/cards/network-organizations.vue';
    import NetworkAnalysis from '@/components/network/cards/network-risk-analysis-charts/network-analysis.vue';
    import {BCard, BListGroup, BListGroupItem, BBadge} from 'bootstrap-vue';

    @Component({
        components: {
            NetworkAnalysis,
            NetworkOrganizations,
            NetworkNodes,
            NetworkStatistics,
            QuorumSetConnections,
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