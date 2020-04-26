<template>
    <div>
        <transition
                name="fade"
                mode="out-in"
        >
            <div class="card pt-0 h-100">
                <div id="sticky">
                    <div class="card-header sb-card-header inverted d-flex align-items-start">
                        <h3 class="title-icon" v-b-tooltip:hover title="network">
                            <b-icon-house scale="0.9" class="bg-success rounded mr-1" variant="light"/>
                        </h3>
                        <div class="d-flex flex-column">
                            <h3 class="card-title sb-card-title">
                                Stellar Public
                            </h3>
                            <h6 class="sb-card-subtitle">Network</h6>
                        </div>
                    </div>
                    <div class="card-body px-4 pt-1 h-100">
                        <div class="sb-nav-bar">
                            <h6 class="sb-navbar-heading">Explore</h6>
                            <div class="overflow">
                                <ul v-if="!store.isLoading" class="sb-nav-list">
                                    <li class="sb-nav-item">
                                        <organizations-dropdown :organizations="networkTransitiveQuorumSetOrganizations"
                                                                :expand="organizationsExpanded"/>
                                    </li>
                                    <li class="sb-nav-item">
                                        <validators-dropdown :nodes="networkTransitiveQuorumSetNodes"
                                                             :expand="validatorsExpanded"/>
                                    </li>
                                </ul>
                            </div>
                            <h6 class="sb-navbar-heading mt-4">Tools</h6>
                            <ul class="sb-nav-list">
                                <li class="sb-nav-item">
                                    <nav-link
                                            :title="'Export configuration'"
                                            v-b-modal.tomlExportModal
                                            :show-icon="true"
                                            icon="download"
                                    />
                                </li>
                                <li class="sb-nav-item">
                                    <nav-link
                                            v-b-modal.simulate-node-modal
                                            :title="'Simulate new node'"
                                            :show-icon="true"
                                            icon="plus"
                                    />
                                    <simulate-new-node/>
                                </li>
                            </ul>

                            <h6 class="sb-navbar-heading mt-3">Options</h6>
                            <ul class="sb-nav-list">
                                <li class="sb-nav-item">
                                    <b-form-checkbox v-model="store.includeWatcherNodes"
                                                     name="include-watcher-nodes-button"
                                                     class="sb-nav-item sb-nav-toggle"
                                                     switch>
                                        Watcher nodes
                                    </b-form-checkbox>
                                </li>
                            </ul>
                            <undo-redo v-if="store.isSimulation || store.hasRedo"/>
                            <b-modal lazy size="lg" id="tomlExportModal"
                                     title="Stellar Core Configuration" ok-only ok-title="Close"
                            >
                                <pre><code>{{tomlNodesExport}}</code></pre>
                            </b-modal>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import ValidatorsDropdown from '@/components/network/sidebar/validators-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import OrganizationsDropdown from '@/components/network/sidebar/organizations-dropdown.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import stickybits from 'stickybits';
    import Search from '@/components/node/search.vue';

    @Component({
        components: {
            Search,
            UndoRedo,
            OrganizationsDropdown,
            NavLink, SimulateNewNode, ValidatorsDropdown
        }
    })
    export default class NetworkSideBar extends Vue {
        protected validatorsExpanded: boolean = false;
        protected organizationsExpanded: boolean = true;

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

        //todo: move to domain
        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.graph.networkTransitiveQuorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey)!);
        }

        //todo: move to domain
        get networkTransitiveQuorumSetOrganizations() {
            return [...new Set(this.networkTransitiveQuorumSetNodes
                .filter(node => node && node.organizationId)
                .map(node => this.network.getOrganizationById(node!.organizationId!))
            )];
        }

        get tomlNodesExport() {
            let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(this.network);
            return stellarCoreConfigurationGenerator.nodesToToml(this.networkTransitiveQuorumSetNodes);
        }

        mounted() {
            stickybits('#sticky');
        }
    }
</script>
<style scoped>
    .overflow {
        overflow-y: auto;
        max-height: calc(100vh - 18rem);
    }
</style>