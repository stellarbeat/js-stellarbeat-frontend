<template>
    <div class="card">
        <div class="menu border-right p-3" v-show="menuVisible">
            <div class="text-gray collapse-icon" v-on:click="menuVisible = false">
                <b-icon-chevron-double-left font-scale="1"/>
            </div>
            <div class="d-flex flex-column justify-content-between h-100">
                <div>
                <h6 class="sb-navbar-heading mt-3 ml-0 pl-0">View</h6>
                <div class="mt-3">
                    <ul style="list-style: none" class="pl-0">
                        <li class="mb-1 view-link" :class="{'view-link-active': view === 'graph'}">
                            <router-link :to="{path: $route.path, query: {'view': 'graph', 'no-scroll': '1'}}"
                                         :class="['graph', undefined].includes($route.query.view) && 'router-link-exact-active'"
                                         v-on:click.native="menuVisible = false">
                                Graph
                            </router-link>
                        </li>
                        <li class="view-link" :class="{'view-link-active': view === 'map'}">
                            <router-link :to="{path: $route.path, query: {'view': 'map', 'no-scroll': '1'}}"
                                         v-on:click.native="menuVisible = false"
                                         :class="$route.query.view === 'map' && 'router-link-exact-active'">Map
                            </router-link>
                        </li>
                    </ul>
                </div>
                <h6 class="sb-navbar-heading mt-3 ml-0 pl-0" v-if="view === 'graph'">Options</h6>
                <div v-if="view === 'graph'">
                    <label v-if="selectedNode" class="mt-2 mr-2">

                        <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                               v-model="optionHighlightTrustedNodes">
                        <span class="custom-switch-indicator"></span>
                        <span class="custom-switch-description">Highlight trusted nodes</span>

                    </label>
                    <label v-if="selectedNode" class="mt-2 mr-2">

                        <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                               v-model="optionHighlightTrustingNodes">
                        <span class="custom-switch-indicator"></span>
                        <span class="custom-switch-description">Highlight trusting nodes</span>

                    </label>
                    <label class="mt-2 mr-2">

                        <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                               v-model="optionShowRegularEdges">
                        <span class="custom-switch-indicator"></span>
                        <span class="custom-switch-description">Show regular edges</span>

                    </label>
                    <label class="mt-2 mr-2">

                        <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                               v-model="optionShowFailingEdges">
                        <span class="custom-switch-indicator"></span>
                        <span class="custom-switch-description">Show failing edges</span>

                    </label>
                </div>
                </div>
                <div>
                    <graph-legend v-if="view === 'graph'"/>
                </div>
            </div>
        </div>
        <div class="card-header m-0 p-0 d-flex">
            <div class="menu-button ml-3 text-gray" v-on:click="menuVisible = true">
                <b-icon-list font-scale="2"/>
            </div>
            <div class="pl-3 sb-bread-crumbs-container py-0">
                <b-breadcrumb class="sb-bread-crumbs" :items="breadCrumbs">
                </b-breadcrumb>
            </div>
        </div>
        <div class="card-body p-0">
            <div v-if="network.graph.networkTransitiveQuorumSet.size === 0"
                 class="card-alert alert alert-danger" show>No transitive quorum set detected in network!
            </div>
            <div v-if="view==='map'" style="height: 430px">
                <div class="world-loader">
                    <div class="loader"></div>
                </div>
                <world-map/>
            </div>
            <Graph :optionHighlightTrustedNodes="optionHighlightTrustedNodes"
                   :option-highlight-trusting-nodes="optionHighlightTrustingNodes"
                   :option-show-failing-edges="optionShowFailingEdges"
                   :option-show-regular-edges="optionShowRegularEdges" v-if="view === 'graph'" ref="graph"
                   :network="network"
                   :centerNode="centerNode"
                   :selectedNode="selectedNode"
            />
            <div v-show="!menuVisible" class="preview" v-on:click="navigateToView">
                <img v-if="view === 'map'" src="@/assets/graph-preview.png" alt="graph-preview" class="preview-image">
                <img v-else src="@/assets/map-preview.png" alt="map-preview" class="preview-image">
                <!--div class="preview-text">map</div!-->
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import NetworkGraphCard from '@/components/visual-navigator/network-graph-card.vue';
    import SimulationBadge from '@/components/simulation-badge.vue';
    import {BBreadcrumb, BIconList, BButton, BIconChevronDoubleLeft} from 'bootstrap-vue';
    import Graph from '@/components/visual-navigator/graph/graph.vue';
    import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';

    @Component({
        name: 'network-visual-navigator',
        components: {
            GraphLegend,
            Graph,
            SimulationBadge,
            NetworkGraphCard,
            WorldMap: () => import('@/components/visual-navigator/world-map.vue'),
            BBreadcrumb,
            BIconList,
            BButton,
            BIconChevronDoubleLeft
        }
    })
    export default class NetworkVisualNavigator extends Vue {
        @Prop({default: 'map'})
        public view!: string;

        public optionShowFailingEdges: boolean = false;
        public optionHighlightTrustingNodes: boolean = true;
        public optionHighlightTrustedNodes: boolean = true;
        public optionShowRegularEdges: boolean = true;

        protected menuVisible: boolean = false;

        get breadCrumbs() {
            let crumbs = [];
            crumbs.push({
                text: 'Stellar Public Network',
                to: {name: 'network-dashboard', query: {view: this.$route.query.view}}
            });

            if (this.selectedNode) {
                if (this.selectedNode.organizationId && this.network.getOrganizationById(this.selectedNode.organizationId))
                    crumbs.push({
                        text: this.network.getOrganizationById(this.selectedNode.organizationId)!.name,
                        to: {
                            name: 'organization-dashboard',
                            params: {'organizationId': this.selectedNode.organizationId, 'view': this.$route.query.view}
                        },
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

        navigateToView() {
            let toView = this.view === 'map' ? 'graph' : 'map';
            this.$router.push(
                {
                    name: this.$route.name ? this.$route.name : undefined,
                    params: this.$route.params,
                    query: {'view': toView, 'no-scroll': '1'},
                },
            );
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get centerNode() {
            return this.store.centerNode;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
        }

        get network() {
            return this.store.network;
        }
    }
</script>
<style scoped>
    .collapse-icon {
        cursor: pointer;
        position: absolute;
        right: 8px;
        top: 10px;
    }

    .menu {
        z-index: 5000;
        position: absolute;
        background: white;
        width: 250px;
        height: 100%;
    }

    .menu-button {
        cursor: pointer;

    }

    .view-link {
        text-underline: none;
        padding-left: 7px;
        color: #818181;
        cursor: pointer;
    }

    .view-link-active {
        background-color: rgba(32, 107, 196, .06);
    }

    .view-link a {
        text-decoration: none;
        color: rgba(0, 0, 0, .55);
    }

    .view-link:hover {
        background-color: #f8f9fa;
        text-decoration: none;
    }

    .router-link-exact-active {
        color: #206bc4 !important;
        text-decoration: none;
    }

    .preview-text {
        position: absolute;
        bottom: 0px;
        height: 25px;
        color: white;
        width: 100%;
        text-align: center;
        border-radius: 5px;
        background: linear-gradient(0deg, rgba(67, 104, 113, 1) 0%, rgba(170, 211, 223, 1) 100%);
    }

    .preview-image {
        border-radius: 5px;
    }

    .preview {
        z-index: 1000;
        position: absolute;
        left: 10px;
        bottom: 10px;
        width: 60px;
        height: 60px;
        border-radius: 5px;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        background: white;
    }

    .sb-bread-crumbs {
        background-color: white;
        margin: 0px;
        padding: 0px;
        align-self: center;
    }

    .sb-bread-crumbs-container {
        display: flex;
        flex-grow: 1;
        align-items: center;
    }

    .world-loader {
        position: absolute;
        left: 50%;
        right: 50%;
        top: 30%;
    }
</style>