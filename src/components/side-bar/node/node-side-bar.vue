<template>
    <div>
        <transition
                name="fade"
                mode="out-in"
        >
            <div class="card pt-0" :key="selectedNode.publicKey">
                <div class="card-header px-4 pb-4 sb-card-header">
                    <h3 class="card-title sb-card-title"><i class="fe fe-target sb-card-title-icon mr-1"/>
                        {{getDisplayName(selectedNode)}}</h3>
                </div>
                <div class="card-body px-4 pt-1">
                    <div class="sb-nav-bar">
                        <h6 class="sb-navbar-heading">Explore</h6>
                        <ul v-if="!store.isLoading" class="sb-nav-list">
                            <li class="sb-nav-item" v-if="selectedNode.organizationId">
                                <organization-validators-dropdown :organization="organization"
                                                                  :expand="false"/>
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
                                        :title="'Export configuration'"
                                        v-b-modal.tomlExportModal
                                        :show-icon="true"
                                        icon="fe-save"
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
                                        v-on:click=""
                                />
                            </li>
                            <li class="sb-nav-item">
                                <nav-link
                                        title="Copy publickey to clipboard"
                                        :show-icon="true"
                                        icon="fe-clipboard"
                                        v-clipboard:copy="selectedNode.publicKey"
                                />
                            </li>
                        </ul>

                        <h6 class="sb-navbar-heading mt-3">Options</h6>
                        <ul class="sb-nav-list">
                            <li class="sb-nav-item">
                                <b-form-checkbox v-model="includeWatcherNodes" name="include-watcher-nodes-button"
                                                 class="sb-nav-item sb-nav-toggle"
                                                 switch>
                                    Show watcher nodes
                                </b-form-checkbox>
                            </li>
                        </ul>
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
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import QuorumSetDropdown from '@/components/side-bar/node/quorum-set-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/quorum-monitor-deprecated/quorum-set-explorer/simulate-new-node.vue';
    import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import OrganizationsDropdown from '@/components/side-bar/network/organizations-dropdown.vue';
    import OrganizationValidatorsDropdown from '@/components/side-bar/node/organization-validators-dropdown.vue';

    @Component({
        components: {
            OrganizationValidatorsDropdown,
            OrganizationsDropdown,
            SimulateNewNode,
            NavLink,
            QuorumSetDropdown
        }
    })
    export default class NodeSideBar extends Vue {
        protected includeWatcherNodes: boolean = false;
        protected validatorsExpanded: boolean = false;
        protected organizationsExpanded: boolean = true;

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
    .sb-card-title-icon {
        opacity: 0.6;
        width: 30px;
        color: #1997c6;
    }

    .sb-card-header {
        border: none;
        margin-top: 10px;
        margin-bottom: 0px;
        margin-left: 4px;
    }

    .sb-card-title {
        text-transform: capitalize;
    }

    .sb-navbar-heading {
        font-size: .6875rem;
        font-weight: 600;
        text-transform: uppercase;
        text-align: left;
        letter-spacing: .04em;
        color: #868c97;
        display: block;
        margin-bottom: 8px;
        padding-left: 5px;
    }

    .sb-nav-bar {
        list-style: none;
        flex: 0 0 220px;
    }

    .sb-nav-list {
        padding-left: 0px;
    }

    .sb-nav-item {
        width: 100%;
        color: rgba(0, 0, 0, .55);
        font-weight: 400;
        font-size: 100%;
        text-decoration: none;
        list-style: none;
        margin-bottom: 1px;
        margin-top: 1px;
    }

    .sb-nav-dropdown {
        margin-left: 0em;
    }
</style>