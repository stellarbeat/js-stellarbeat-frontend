<template>
    <div class="card">
        <div v-if="network.graph.networkTransitiveQuorumSet.size === 0"
             class="card-alert alert alert-danger mb-0" show>No Transitive Quorum Set Detected in network!
        </div>
        <div class="card-header sb-card-header pl-3 pt-0 pb-0 m-0">
            <b-button-group size="sm" class="mr-3">
                <b-button :pressed="view === 'map'" @click="view = 'map'">Map</b-button>
                <b-button :pressed="view === 'graph'" @click="view = 'graph'">Graph</b-button>
            </b-button-group>
            <transition
                    name="fade"
                    mode="out-in"
            >
            <b-breadcrumb class="sb-bread-crumbs" :items="breadCrumbs" :key="breadCrumbKey">
                <b-breadcrumb-item href="#home">
                    <b-icon icon="house-fill" scale="1.25" shift-v="1.25" aria-hidden="true"></b-icon>
                    Home
                </b-breadcrumb-item>
            </b-breadcrumb>
            </transition>
        </div>
        <div class="card-body p-0" style="height: 450px">
            <world-map v-if="view==='map'"></world-map>
            <network-graph-card v-if="view === 'graph'"
                                v-on:show-halting-analysis="$emit('show-halting-analysis', selectedNode.publicKey)"></network-graph-card>
        </div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import WorldMap from '@/components/visual-navigator/world-map.vue';
    import NetworkGraphCard from '@/components/visual-navigator/network-graph-card.vue';

    @Component({
        name: 'network-visual-navigator',
        components: {NetworkGraphCard, WorldMap}
    })
    export default class NetworkVisualNavigator extends Vue {
        protected view: string = 'map';

        get breadCrumbs() {
            //todo expand to orgs
            let crumbs = [];
            crumbs.push({
                text: 'Stellar Public Network',
                href: '#'
            });
            if(this.selectedNode)
                crumbs.push({
                    text: this.selectedNode.displayName,
                    href: '#'
                });

            return crumbs;
        }

        get breadCrumbKey() {
            //todo expand to orgs
            if(this.selectedNode?.publicKey)
                return this.selectedNode?.publicKey;

            return 'stellar-public-network';
        }

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
    .sb-card-header{
        min-height: 50px;
    }
    .sb-bread-crumbs {
        background-color: white;
        margin-bottom: 0px;
        padding-left: 0px;
    }
</style>