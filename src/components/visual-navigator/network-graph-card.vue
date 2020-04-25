<template>
    <Graph ref="graph" :network="network"
           :centerNode="centerNode"
           :selectedNode="selectedNode"
    />
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import Graph from '@/components/visual-navigator/graph/graph.vue';
    import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';

    @Component({
        name: 'network-graph-card',
        components: {GraphLegend, Graph}
    })
    export default class NetworkGraphCard extends Vue {
        @Watch('$root.$data.store.network', {deep: true})

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get centerNode() {
            return this.store.centerNode;
        }

        get network() {
            return this.store.network;
        }
    }
</script>
<style scoped>

</style>