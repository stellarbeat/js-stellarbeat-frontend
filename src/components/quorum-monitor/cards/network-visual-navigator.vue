<template>
    <div class="card">
        <div class="card-header pl-3">
            <b-button-group size="sm" class="mr-3">
                <b-button :pressed="view === 'graph'" @click="view = 'graph'">Graph</b-button>
                <b-button :pressed="view === 'map'" @click="view = 'map'">Map</b-button>
            </b-button-group>
            <h5 class="card-title">
                Stellar Public Network Navigator
            </h5>
        </div>
        <div class="card-body p-0" style="height: 450px">
            <world-map v-if="view==='map'"></world-map>
            <network-graph-card v-if="view === 'graph'"v-on:show-halting-analysis="$emit('show-halting-analysis', selectedNode.publicKey)"></network-graph-card>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import Store from "@/store/Store";
    import WorldMap from '@/components/home/network-visual-navigator/world-map.vue';
    import NetworkGraphCard from '@/components/quorum-monitor/cards/network-graph-card.vue';

    @Component({
        name: "network-visual-navigator",
        components: {NetworkGraphCard, WorldMap}
    })
    export default class NetworkVisualNavigator extends Vue
    {
        protected view:string = 'graph';
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