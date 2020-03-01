<template>
    <div class="card">
        <div v-if="network.graph.networkTransitiveQuorumSet.size === 0"
             class="card-alert alert alert-danger mb-0" show>No Transitive Quorum Set Detected in network!
        </div>
        <div class="card-body p-0" style="height: 350px">
            <world-map v-if="view==='map'"></world-map>
            <network-graph-card v-else
                                v-on:show-halting-analysis="$emit('show-halting-analysis', selectedNode.publicKey)"></network-graph-card>
            <b-button-group size="sm" class="selector">
                <b-button :pressed="view === 'map'" @click="view = 'map'">Map</b-button>
                <b-button :pressed="view === 'graph'" @click="view = 'graph'">Graph</b-button>
            </b-button-group>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import WorldMap from '@/components/home/network-visual-navigator/world-map.vue';
    import NetworkGraphCard from '@/components/quorum-monitor/cards/network-graph-card.vue';

    @Component({
        name: 'network-visual-navigator',
        components: {NetworkGraphCard, WorldMap}
    })
    export default class NetworkVisualNavigator extends Vue {
        protected view: string = 'map';

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
    .card-title {
        display: block;
        margin: 0 0 1rem;
        font-size: 1.125rem;
        font-weight: 600;
        line-height: 1.3333333;
    }

    .selector {
        position: absolute;
        bottom: 0;
        padding-left: 15px;
        padding-bottom: 13px;
        z-index: 1000000;
    }
</style>