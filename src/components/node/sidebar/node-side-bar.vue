<template>
    <div>
        <div class="card pt-0 sidebar-card h-100">
            <div id="sticky">
                <div class="card-header sb-card-header d-flex inverted d-flex align-items-start">
                    <h3 class="title-icon">
                        <b-icon-bullseye scale="0.8" v-b-tooltip.hover
                                         class="bg-success rounded mr-1" variant="light"/>
                    </h3>

                    <transition
                            name="fade"
                            mode="out-in"
                    >

                        <div class="d-flex flex-column" :key="selectedNode.publicKey">
                            <h3 class="card-title sb-card-title">
                                {{getDisplayName(selectedNode)}}
                            </h3>

                            <h6 class="sb-card-subtitle">
                                {{nodeType}}
                                <b-badge v-show="network.isNodeFailing(selectedNode)" variant="danger"
                                         style="vertical-align: bottom">Failing
                                </b-badge>

                            </h6>
                        </div>
                    </transition>
                </div>
                <div class="card-body px-4 pt-1">
                    <div class="sb-nav-bar">
                        <h6 class="sb-navbar-heading">Explore</h6>
                        <div class="overflow">
                        <transition
                                name="fade"
                                mode="out-in"
                        >
                            <div :key="selectedNode.publicKey">
                                <ul v-if="!store.isLoading" class="sb-nav-list">
                                    <li class="sb-nav-item" v-if="selectedNode.organizationId">
                                        <organization-validators-dropdown :organization="organization"
                                                                          :expand="true"/>
                                    </li>
                                    <li class="sb-nav-item">
                                        <quorum-set-dropdown :quorum-set="selectedNode.quorumSet"
                                                             :expand="quorumSetExpanded" v-on:toggleExpand="quorumSetExpanded=!quorumSetExpanded"/>
                                    </li>
                                </ul>
                            </div>
                        </transition>
                        </div>
                        <h6 class="sb-navbar-heading mt-4">Tools</h6>
                        <ul class="sb-nav-list">
                            <li class="sb-nav-item">
                                <nav-link
                                        :title="selectedNode.isValidating ? 'Stop validating' : 'Try validating'"
                                        :show-icon="true"
                                        :icon="selectedNode.isValidating ? 'lightning-fill' : 'lightning'"
                                        v-on:click="store.toggleValidating(selectedNode)"
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
                            <li class="sb-nav-item">
                                <nav-link
                                        title="Halting analysis"
                                        :show-icon="true"
                                        icon="gear-wide"
                                        v-on:click="store.showHaltingAnalysis(selectedNode)"
                                />
                            </li>
                            <li class="sb-nav-item">
                                <nav-link
                                        :title="'Export configuration'"
                                        v-b-modal.tomlExportModal
                                        :show-icon="true"
                                        icon="download"
                                />
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
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import QuorumSetDropdown from '@/components/node/sidebar/quorum-set-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import OrganizationsDropdown from '@/components/network/sidebar/organizations-dropdown.vue';
    import OrganizationValidatorsDropdown from '@/components/node/sidebar/organization-validators-dropdown.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import stickybits from 'stickybits';

    @Component({
        components: {
            UndoRedo,
            OrganizationValidatorsDropdown,
            OrganizationsDropdown,
            SimulateNewNode,
            NavLink,
            QuorumSetDropdown
        }
    })
    export default class NodeSideBar extends Vue {
        public quorumSetExpanded:boolean = false;

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get organization() {
            if (this.selectedNode!.organizationId)
                return this.network.getOrganizationById(this.selectedNode!.organizationId);
            else return null;
        }

        get centerNode() {
            return this.store.centerNode;
        }

        get network() {
            return this.store.network;
        }

        get backGroundClass() {
            return {
                'bg-success': !this.network.isNodeFailing(this.selectedNode!),
                'bg-danger': this.network.isNodeFailing(this.selectedNode!)
            };
        }

        get colorClass() {
            return {
                'success': !this.network.isNodeFailing(this.selectedNode!),
                'danger': this.network.isNodeFailing(this.selectedNode!)
            };
        }

        get nodeType() {
            return this.selectedNode!.isValidator ? (this.selectedNode!.isFullValidator ? 'Full Validator' : 'Validator') : 'Watcher';
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

        getDisplayName(node: Node) {
            if (node.name)
                return node.name;

            return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100);
        }

        mounted() {
            stickybits('#sticky');
        }
    }
</script>
<style scoped>
    .overflow {
        overflow-y: auto;
        max-height: calc(100vh - 20rem);
    }
    .success {
    }

    .danger {
        color: #cd201f
    }
</style>