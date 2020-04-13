<template>
    <div>
        <div class="card pt-0">
            <transition
                    name="fade"
                    mode="out-in"
            >
                <div :key="selectedNode.publicKey">
                    <div class="card-header px-4 sb-card-header">
                        <shield-check v-if="selectedNode.isFullValidator"
                                      v-b-tooltip.hover title="Full Validator" class="sb-card-title-icon"/>
                        <h3 class="card-title sb-card-title">
                            {{getDisplayName(selectedNode)}}</h3>
                    </div>
                    <div v-if="network.isNodeFailing(selectedNode)"
                         class="card-alert alert alert-danger mb-2" show>
                        <i class="fe fe-alert-triangle"></i>
                        Node not validating {{network.isQuorumSetFailing(selectedNode, selectedNode.quorumSet) ? ": quorumset not reaching threshold" : ""}}
                    </div>
                    <div class="card-body px-4 pt-1">
                        <div class="sb-nav-bar">
                            <h6 class="sb-navbar-heading">Explore</h6>
                            <ul v-if="!store.isLoading" class="sb-nav-list">
                                <li class="sb-nav-item" v-if="selectedNode.organizationId">
                                    <organization-validators-dropdown :organization="organization"
                                                                      :expand="true"/>
                                </li>
                                <li class="sb-nav-item">
                                    <quorum-set-dropdown :quorum-set="selectedNode.quorumSet"
                                                         :expand="true"/>
                                </li>
                            </ul>
                            <h6 class="sb-navbar-heading mt-4">Tools</h6>
                            <ul class="sb-nav-list">
                                <li class="sb-nav-item">
                                    <nav-link
                                            :title="selectedNode.isValidating ? 'Stop validating' : 'Try validating'"
                                            :show-icon="true"
                                            :icon="selectedNode.isValidating ? 'fe-zap-off' : 'fe-zap'"
                                            v-on:click="store.toggleValidating(selectedNode)"
                                    />
                                </li>
                                <li class="sb-nav-item">
                                    <nav-link
                                            v-b-modal.simulate-node-modal
                                            :title="'Simulate new node'"
                                            :show-icon="true"
                                            icon="fe-plus-circle"
                                    />
                                    <simulate-new-node/>
                                </li>
                                <li class="sb-nav-item">
                                    <nav-link
                                            title="Halting analysis"
                                            :show-icon="true"
                                            icon="fe-cloud-lightning"
                                            v-on:click="store.showHaltingAnalysis(selectedNode)"
                                    />
                                </li>
                                <li class="sb-nav-item">
                                    <b-alert
                                            :show="clipBoardAlert"
                                            dismissible
                                            variant="info"
                                            @dismissed="clipBoardAlert=0"
                                    >
                                        Copied public key to clipboard!
                                    </b-alert>
                                    <nav-link
                                            title="Copy public key"
                                            :show-icon="true"
                                            icon="fe-clipboard"
                                            v-clipboard:copy="selectedNode.publicKey"
                                            v-on:click="clipBoardAlert = 1"
                                    />
                                </li>
                                <li class="sb-nav-item">
                                    <nav-link
                                            :title="'Export configuration'"
                                            v-b-modal.tomlExportModal
                                            :show-icon="true"
                                            icon="fe-save"
                                    />
                                </li>
                            </ul>

                            <h6 class="sb-navbar-heading mt-3">Options</h6>
                            <ul class="sb-nav-list">
                                <li class="sb-nav-item">
                                    <b-form-checkbox v-model="store.includeWatcherNodes" name="include-watcher-nodes-button"
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
            </transition>
        </div>

    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import QuorumSetDropdown from '@/components/side-bar/node/quorum-set-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import OrganizationsDropdown from '@/components/side-bar/network/organizations-dropdown.vue';
    import OrganizationValidatorsDropdown from '@/components/side-bar/node/organization-validators-dropdown.vue';
    import ShieldCheck from '@/components/svg/shield-check.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';

    @Component({
        components: {
            UndoRedo,
            ShieldCheck,
            OrganizationValidatorsDropdown,
            OrganizationsDropdown,
            SimulateNewNode,
            NavLink,
            QuorumSetDropdown
        }
    })
    export default class NodeSideBar extends Vue {
        protected clipBoardAlert: number = 0;

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
    }
</script>
<style scoped>
</style>