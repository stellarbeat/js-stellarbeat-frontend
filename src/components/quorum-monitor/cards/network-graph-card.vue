<template>
    <Graph ref="graph" :network="network"
           :centerNode="centerNode"
           :selectedNode="selectedNode"
    />
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from '@/store/Store';
    import Graph from '@/components/quorum-monitor/graph/graph.vue';
    import GraphLegend from '@/components/quorum-monitor/graph/graph-legend.vue';

    @Component({
        name: 'network-graph-card',
        components: {GraphLegend, Graph, FullValidatorTitle}
    })
    export default class NetworkGraphCard extends Vue {
        @Watch('$root.$data.store.network', {deep: true})

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
    }
</script>
<style scoped>

</style>