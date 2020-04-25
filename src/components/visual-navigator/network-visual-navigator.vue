<template>
    <div class="card">
        <div class="sb-card-header d-flex flex-wrap-reverse mt-0 pl-1 pt-3 pb-0 m-0">
            <div class="spacer h-100"></div>
            <ul class="sb-tab-nav">
                <li class="sb-tab-nav-item">
                    <router-link :to="{path: $route.path, query: {'view': 'map', 'no-scroll': '1'}}"
                                 :class="['map', undefined].includes($route.query.view)  && 'router-link-exact-active'"
                                 class="sb-tab-nav-link py-2"
                    >Map
                    </router-link>
                </li>
                <li class="sb-tab-nav-item">
                    <router-link :to="{path: $route.path,
                    query: {'view': 'graph', 'no-scroll': '1'}}"
                                 :class="$route.query.view === 'graph' && 'router-link-exact-active'"                                 class="sb-tab-nav-link py-2">Graph
                    </router-link>
                </li>
            </ul>
            <div class="pl-3 sb-bread-crumbs-container py-2">
                <transition
                        name="fade"
                        mode="out-in"
                >
                    <b-breadcrumb class="sb-bread-crumbs" :items="breadCrumbs">
                    </b-breadcrumb>
                </transition>
                <simulation-badge class="mx-2"/>
            </div>
        </div>
        <div class="card-body py-3 px-3 border-top">
            <div v-if="network.graph.networkTransitiveQuorumSet.size === 0"
                 class="card-alert alert alert-danger" show>No transitive quorum set detected in network!
            </div>
            <world-map v-if="view==='map'"/>
            <network-graph-card v-if="view === 'graph'"/>
        </div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import WorldMap from '@/components/visual-navigator/world-map.vue';
    import NetworkGraphCard from '@/components/visual-navigator/network-graph-card.vue';
    import SimulationBadge from '@/components/simulation-badge.vue';

    @Component({
        name: 'network-visual-navigator',
        components: {SimulationBadge, NetworkGraphCard, WorldMap}
    })
    export default class NetworkVisualNavigator extends Vue {
        @Prop({default: 'map'})
        public view!: string;

        get breadCrumbs() {
            let crumbs = [];
            crumbs.push({
                text: 'Stellar Public Network',
                to: {name: 'network-dashboard', query: {view: this.$route.query.view}}
            });

            if (this.selectedNode) {
                if (this.selectedNode.organizationId)
                    crumbs.push({
                        text: this.network.getOrganizationById(this.selectedNode.organizationId)!.name,
                        to: {name: 'organization-dashboard', params: { 'organizationId': this.selectedNode.organizationId, 'view': this.$route.query.view }},
                        active: false
                    });
                crumbs.push({
                    text: this.selectedNode.displayName,
                    active: true
                });
            } else if (this.selectedOrganization)
                crumbs.push({
                    text: this.selectedOrganization.name,
                    active: true
                });
            return crumbs;
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
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
    .spacer {
        width: 10px;
        height: 100%;
        align-self: end;
    }

    .sb-bread-crumbs {
        background-color: white;
        margin: 0px;
        padding: 0px;
        align-self: center;
    }

    .sb-tab-nav {
        display: flex;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
        position: relative;
        z-index: 1000;
        border-bottom: 0;
    }

    .sb-tab-nav-link.sb-tab-active {
        border-color: rgba(134, 140, 151, .34);
        color: #495057;
    }

    .sb-tab-nav .sb-tab-nav-link:hover {
        color: #495057;
    }

    .sb-tab-nav-link {
        display: flex;
        align-items: center;
        text-decoration: none;
        color: #868c97;
        background: rgba(53, 64, 82, .1);
        border: 1px solid rgba(134, 140, 151, .24);
        border-bottom: 0;
        padding: 5px 20px;
        border-radius: 0px;
    }

    .router-link-exact-active {
        border-bottom: 1px solid white !important;
        margin-bottom: -1px;
        background: #fff !important;
    }

    .sb-bread-crumbs-container {
        display: flex;
        flex-grow: 1;
        align-items: center;
    }
</style>