<template>
<div>
            <node-list :network="network" :nodes="networkTransitiveQuorumSetNodes"
                       :render-title="false"
            />
            <b-modal lazy size="lg" id="tomlExportModal"
                     title="Stellar Core Configuration" ok-only ok-title="Close"
            >
                <pre><code>{{tomlNodesExport}}</code></pre>
            </b-modal>
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

    @Component({
        components: {NodeList, SimulateNewNode, GraphLegend, Graph, FullValidatorTitle}
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