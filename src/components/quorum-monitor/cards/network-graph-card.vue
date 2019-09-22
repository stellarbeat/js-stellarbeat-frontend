<template>
    <div class="card">
        <div class="card-header d-flex">
            <h3 v-if="false" class="card-title">
                <full-validator-title :node="selectedNode"/>
            </h3>
            <h3 v-else class="card-title">Stellar Public Network
                <b-badge v-show="store.isSimulation" variant="warning">Simulation</b-badge>
            </h3>
        </div>
        <div class="card-body py-2" style="height: 100%">
            <Graph ref="graph" :network="network"
                   :centerNode="centerNode"
                   :selectedNode="selectedNode"
            ></Graph>
            <div v-show="false" class="text-right pt-1">
                <GraphLegend></GraphLegend>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from "@/Store";
    import Graph from '@/components/quorum-monitor/graph/graph.vue';
    import GraphLegend from '@/components/quorum-monitor/graph/graph-legend.vue';

    @Component({
        name: "network-graph-card",
        components: {GraphLegend, Graph, FullValidatorTitle}
    })
    export default class NetworkGraphCard extends Vue
    {
        @Watch("$root.$data.store.network", {deep:true})

        get store():Store {
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
    }
</script>
<style scoped>

</style>