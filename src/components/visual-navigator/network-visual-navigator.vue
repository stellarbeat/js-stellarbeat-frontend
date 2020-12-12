<template>
    <div class="card" :class="{'card-fullscreen': fullScreen, 'sb-card-fullscreen': fullScreen}" style="height: 600px">
        <div class="menu border-right p-3" v-show="menuVisible">
            <div class="text-gray collapse-icon" v-on:click="menuVisible = false">
                <b-icon-chevron-double-left font-scale="1"/>
            </div>
            <div class="d-flex flex-column justify-content-between h-100">
                <div>
                    <h6 class="sb-navbar-heading mt-3 ml-0 pl-0">View</h6>
                    <div class="mt-3">
                        <ul style="list-style: none" class="pl-0">
                            <router-link tag="li" :to="{path: $route.path, query: {'view': 'graph', 'no-scroll': '1', 'network': $route.query.network}}"
                                         :class="['graph', undefined].includes($route.query.view) &&'router-link-exact-active'"
                                         class="pl-3 mb-1 view-link"
                                         v-on:click.native="menuVisible = false">
                                Node trust graph
                            </router-link>
                            <router-link tag="li" :to="{path: $route.path, query: {'view': 'graph-org', 'no-scroll': '1', 'network': $route.query.network}}"
                                         :class="['graph-org'].includes($route.query.view) &&'router-link-exact-active'"
                                         class="pl-3 mb-1 view-link"
                                         v-on:click.native="menuVisible = false">
                                Organization trust graph
                            </router-link>
                            <router-link tag="li" :to="{path: $route.path, query: {'view': 'map', 'no-scroll': '1', 'network': $route.query.network}}"
                                         v-on:click.native="menuVisible = false"
                                         class="pl-3 mb-1 view-link"
                                         :class="$route.query.view === 'map' && 'router-link-exact-active'">Map
                            </router-link>
                        </ul>
                    </div>
                    <h6 class="sb-navbar-heading mt-3 ml-0 pl-0" v-if="view === 'graph' || view === 'graph-org'">Options</h6>
                    <div v-if="view === 'graph' || view === 'graph-org'">
                        <b-form-checkbox v-model="optionHighlightTrustedNodes" v-show="selectedNode"
                                         class="sb-nav-item sb-nav-toggle mt-1"
                                         switch>
                            Highlight trusted nodes
                        </b-form-checkbox>
                        <b-form-checkbox v-model="optionHighlightTrustingNodes" v-show="selectedNode"
                                         class="sb-nav-item sb-nav-toggle mt-1"
                                         switch>
                            Highlight trusting nodes
                        </b-form-checkbox>
                        <b-form-checkbox v-model="optionShowRegularEdges"
                                         class="sb-nav-item sb-nav-toggle mt-1"
                                         switch>
                            Show active edges
                        </b-form-checkbox>
                        <b-form-checkbox v-model="optionShowFailingEdges"
                                         class="sb-nav-item sb-nav-toggle mt-1"
                                         switch>
                            Show failing edges
                        </b-form-checkbox>
                        <b-form-checkbox v-model="optionTransitiveQuorumSetOnly"
                                         class="sb-nav-item sb-nav-toggle mt-1"
                                         switch>
                            Transitive quorum set only
                        </b-form-checkbox>
                    </div>
                </div>
                <div>
                    <graph-legend v-if="view === 'graph' || view === 'graph-org'"/>
                </div>
            </div>
        </div>
        <div class="card-header m-0 p-0 d-flex border-0">
            <div class="menu-button ml-3 text-gray" v-on:click="menuVisible = true">
                <b-icon-list font-scale="2"/>
            </div>
            <div class="pl-3 sb-bread-crumbs-container py-0">
                <b-breadcrumb class="sb-bread-crumbs" :items="breadCrumbs">
                </b-breadcrumb>
            </div>
            <a v-if="!fullScreen" href="#" class="card-options-fullscreen mx-4" @click.prevent.stop="fullScreen=true" v-b-tooltip="'Fullscreen'">
                <b-icon-fullscreen/>
            </a>
            <a v-else href="#" class="card-options-fullscreen mx-4" @click.prevent.stop="fullScreen=false" v-b-tooltip="'Exit fullscreen'">
                <b-icon-fullscreen-exit/>
            </a>
        </div>
        <div class="card-body p-0">
            <div v-if="network.nodesTrustGraph.networkTransitiveQuorumSet.size === 0"
                 class="card-alert alert alert-danger" show>No transitive quorum set detected in network!
            </div>
            <div v-if="view==='map'" style="height: 100%">
                <div class="world-loader">
                    <div class="loader"></div>
                </div>
                <world-map :fullScreen="fullScreen"/>
            </div>
            <network-graph-card v-else :full-screen="fullScreen"
            :optionShowFailingEdges="optionShowFailingEdges"
            :optionHighlightTrustingNodes="optionHighlightTrustingNodes"
            :optionHighlightTrustedNodes="optionHighlightTrustedNodes"
            :optionShowRegularEdges="optionShowRegularEdges"
            :optionTransitiveQuorumSetOnly="optionTransitiveQuorumSetOnly"
            :type="view === 'graph' ? 'node' : 'organization'">
            </network-graph-card>

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
    import {
        BBreadcrumb,
        BIconList,
        BButton,
        BIconChevronDoubleLeft,
        BFormCheckbox,
        BIconFullscreen,
        BIconFullscreenExit, VBTooltip
    } from 'bootstrap-vue';
    import Graph from '@/components/visual-navigator/graph/graph.vue';
    import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';
    import ClientOnly from 'vue-client-only';
    import WorldMap from '@/components/visual-navigator/world-map.vue';

    @Component({
        name: 'network-visual-navigator',
        components: {
            GraphLegend,
            Graph,
            SimulationBadge,
            NetworkGraphCard,
            'world-map': () => import('@/components/visual-navigator/world-map.vue'),
            BBreadcrumb,
            BIconList,
            BButton,
            BIconChevronDoubleLeft,
            BFormCheckbox, BIconFullscreen, BIconFullscreenExit,
            ClientOnly
        },
        directives: {'b-tooltip': VBTooltip}
    })
    export default class NetworkVisualNavigator extends Vue {
        @Prop({default: 'map'})
        public view!: string;

        public optionShowFailingEdges: boolean = false;
        public optionHighlightTrustingNodes: boolean = true;
        public optionHighlightTrustedNodes: boolean = true;
        public optionShowRegularEdges: boolean = true;
        public optionTransitiveQuorumSetOnly: boolean = false;

        protected menuVisible: boolean = false;
        protected fullScreen: boolean = false;

        get breadCrumbs() {
            let crumbs = [];
            crumbs.push({
                text: this.store.getNetworkIdPretty(),
                to: {name: 'network-dashboard', query: {view: this.$route.query.view, 'network': this.$route.query.network}}
            });

            if (this.selectedNode) {
                if (this.selectedNode.organizationId && this.network.getOrganizationById(this.selectedNode.organizationId))
                    crumbs.push({
                        text: this.network.getOrganizationById(this.selectedNode.organizationId)!.name,
                        to: {
                            name: 'organization-dashboard',
                            params: {'organizationId': this.selectedNode.organizationId},
                            query: {'view': this.$route.query.view, 'network': this.$route.query.network}
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
                    query: {'view': toView, 'no-scroll': '1', 'network': this.$route.query.network},
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

    .sb-bread-crumbs {
        background: white!important;
        margin: 0px;
        padding: 0px;
        align-self: center;
    }

    .sb-card-fullscreen {
        z-index: 2;
        height: 100%!important;
    }

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
        background-color: rgba(32, 107, 196, .06);
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