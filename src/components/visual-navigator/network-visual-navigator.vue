<template>
    <div class="card">
        <div class="sb-card-header d-flex mt-0 pt-3 pb-0 m-0">
            <div class="spacer h-100 border-bottom"></div>
            <ul class="sb-tab-nav">
                <li class="sb-tab-nav-item">
                    <a href="#" @click.prevent.stop="view = 'map'" :class="getActiveClass('map')" class="sb-tab-nav-link border-bottom"
                       data-toggle="tab">Map</a>
                </li>
                <li class="sb-tab-nav-item">
                    <a href="#" @click.prevent.stop="view = 'graph'"
                       :class="getActiveClass('graph')"
                       class="sb-tab-nav-link border-left-0 border-bottom"
                       data-toggle="tab">Graph</a>
                </li>
            </ul>
            <div class="pl-3 sb-bread-crumbs-container border-bottom">
                <transition
                        name="fade"
                        mode="out-in"
                >
                    <b-breadcrumb class="sb-bread-crumbs" :items="breadCrumbs" :key="breadCrumbKey">
                    </b-breadcrumb>
                </transition>
            </div>
        </div>
        <div v-if="network.graph.networkTransitiveQuorumSet.size === 0"
             class="card-alert alert alert-danger mb-0" show>No transitive quorum set detected in network!
        </div>
        <div class="card-body py-3 px-3" style="height: 450px">
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

    @Component({
        name: 'network-visual-navigator',
        components: {NetworkGraphCard, WorldMap}
    })
    export default class NetworkVisualNavigator extends Vue {
        protected view: string = 'map';

        getActiveClass(linkView:string){
            return {
                'sb-tab-active': linkView === this.view
            }
        }
        get breadCrumbs() {
            //todo expand to orgs
            let crumbs = [];
            crumbs.push({
                text: 'Stellar Public Network',
                to: {name: 'network-dashboard'}
            });
            if (this.selectedNode)
                crumbs.push({
                    text: this.selectedNode.displayName,
                    active: true
                });
            if (this.selectedOrganization)
                crumbs.push({
                    text: this.selectedOrganization.name,
                    active: true
                });
            return crumbs;
        }

        get breadCrumbKey() {
            //todo expand to orgs
            if (this.selectedNode?.publicKey)
                return this.selectedNode?.publicKey;

            return 'stellar-public-network';
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

    .sb-tab-active {
        background: #fff !important;
        border-bottom: 0 !important;
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

    .sb-bread-crumbs-container {
        display: flex;
        flex-grow: 1;
    }
</style>