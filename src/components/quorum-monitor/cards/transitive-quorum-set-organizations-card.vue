<template>
    <div class="card">
        <div class="card-header">
            <div class="card-title">Organizations in Transitive Quorumset</div>
        </div>
        <div class="card-body py-2 px-0">
            <organization-list :organizations="networkTransitiveQuorumSetOrganizations"/>
        </div>
        <div class="card-footer p-3 d-flex">
            <b-button v-b-tooltip.hover title="Export Stellar Core QuorumSet configuration"
                      v-b-modal.tomlExportModal size="sm" variant="primary">
                <i class="fe fe-save"></i>
                Configuration
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from '@/store/Store';
    import Graph from '@/components/quorum-monitor/graph/graph.vue';
    import GraphLegend from '@/components/quorum-monitor/graph/graph-legend.vue';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import SimulateNewNode from '@/components/quorum-monitor/quorum-set-explorer/simulate-new-node.vue';
    import NodeList from '@/components/quorum-monitor/quorum-set-explorer/node-list.vue';
    import OrganizationList from '@/components/quorum-monitor/quorum-set-explorer/organization-list.vue';

    @Component({
        components: {OrganizationList, NodeList, SimulateNewNode, GraphLegend, Graph, FullValidatorTitle}
    })
    export default class TransitiveQuorumSetValidatorsCard extends Vue {

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get centerNode() {
            return this.store.quorumMonitorStore.centerNode;
        }

        get network() {
            return this.store.network;
        }

        get networkTransitiveQuorumSetOrganizations() {
            return [...new Set(this.networkTransitiveQuorumSetNodes
                .filter(node => node && node.organizationId)
                .map(node => this.network.getOrganizationById(node!.organizationId!))
            )];
        }

        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.graph.networkTransitiveQuorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey)!);
        }

        get tomlNodesExport() {
            let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(this.network);
            return stellarCoreConfigurationGenerator.nodesToToml(this.networkTransitiveQuorumSetNodes);
        }
    }
</script>
<style scoped>

</style>