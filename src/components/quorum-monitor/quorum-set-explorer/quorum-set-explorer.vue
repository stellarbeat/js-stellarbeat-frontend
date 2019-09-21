<template>
    <div v-if="selectedNode" class="quorum-set-explorer">
        <div class="row mt-2">
            <div class="col-sm-12">
                <div class="nodes-title active">
                    <div class="d-flex w-100">
                        <i class="fe fe-link mr-1 public-key"
                           v-b-popover.hover.top="'Publickey'"
                        ></i>
                        <div class="d-flex justify-content-between w-100">
                        <h5 class="mb-0 public-key"
                            v-b-popover.hover.top="selectedNode.publicKey">
                            {{selectedNode.publicKey.substr(0, 12)}}...{{selectedNode.publicKey.substr(50, 100)}}
                        </h5>
                        <button class="btn btn-secondary btn-sm ml-1 border-0" type="button"
                                v-clipboard:copy="selectedNode.publicKey"
                                v-b-popover.hover.top="'Copy publickey to clipboard'">
                            <i class="fe fe-save"></i>
                        </button>
                        </div>
                    </div>
                </div>

                <div v-if="selectedNode.organizationId" class="row">
                    <div class="col-sm-12">
                        <NodeList
                                :nodes="getFellowOrganizationNodes(selectedNode)"
                                :network="network"
                                :title="network.getOrganizationById(selectedNode.organizationId).name"
                                v-on:node-toggle-active="toggleNodeActive"
                                v-on:node-toggle-validating="toggleNodeValidating"
                                v-on:node-show-modal="showModal"
                        >

                        </NodeList>
                    </div>

                </div>

                <div>
                    <ul class="mt-0 tree list-group list-group-flush">
                        <QuorumSetDisplay :quorumSet="selectedNode.quorumSet"
                                          :network="network"
                                          :root="true"
                                          :level=1
                                          :possibleValidatorsToAdd="possibleValidatorsToAdd"
                                          :selectedNode="selectedNode"
                                          v-on:node-toggle-active="toggleNodeActive"
                                          v-on:node-toggle-validating="toggleNodeValidating"
                                          v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                                          v-on:node-show-modal="showModal"
                                          v-on:delete-validator-from-quorum-set="deleteValidatorFromQuorumSet"
                                          v-on:delete-quorum-set="deleteInnerQuorumSet"
                                          v-on:add-quorum-set="addInnerQuorumSet"
                                          v-on:add-validators="addValidators"
                        >
                        </QuorumSetDisplay>
                    </ul>
                </div>

            </div>
        </div>
        <div v-show="selectedNode.isValidator" class="row">
            <div class="col-sm-12">
                <NodeList
                        :nodes="network.getTrustingNodes(selectedNode) ? network.getTrustingNodes(selectedNode) : []"
                        :network="network"
                        :title="'Trusted by ' + numberOfValidatingTrustingNodes + ' validating nodes'"
                        v-on:node-toggle-active="toggleNodeActive"
                        v-on:node-toggle-validating="toggleNodeValidating"
                        v-on:node-show-modal="showModal"
                >

                </NodeList>
            </div>

        </div>
        <div v-if="false" class="row">
            <div class="col-sm-12">
                <NodeStatisticsListItem :node="selectedNode" :network="network"></NodeStatisticsListItem>
            </div>
        </div>
        <b-button-group size="sm" class="mt-1">
            <b-button title="Node info"
                      v-on:click="showModal(selectedNode)">
                Node <i class="fe fe-info"/>
            </b-button>
            <b-button v-if="selectedNode.organizationId" title="Organization info"
                      v-on:click="navigateToOrg">
                Organization <i class="fe fe-info"/>
            </b-button>
        </b-button-group>
        <b-dropdown size="sm" variant="secondary" right id="more" no-caret class="pt-2"
        >
            <template slot="button-content">
                Simulation options
                <i class="fe fe-more-vertical"></i>
            </template>
            <b-dropdown-item v-if="selectedNode.isValidating" v-on:click="$emit('node-toggle-validating', selectedNode)">
                <i class="dropdown-icon fe fe-activity"></i>
                Stop validating
            </b-dropdown-item>
            <b-dropdown-item v-else v-on:click="$emit('node-toggle-validating', selectedNode)"
                             v-b-popover.hover.top="'A Node can still fail if it\'s quorumset doesn\'t meet its treshold'">
                <i class="dropdown-icon fe fe-activity"></i>
                Try validating
            </b-dropdown-item>
            <b-dropdown-item v-on:click="$emit('show-halting-analysis', selectedNode.publicKey)">
                <i class="dropdown-icon fe fe-settings"></i>
                Perform halting analysis (beta)
            </b-dropdown-item>
        </b-dropdown>

        <b-modal v-if="modalNode"
                 ok-title="Close" size="lg" ok-only id="node-details-modal" ref="modal"
                 v-bind:title="modalNode.displayName">
            <b-table stacked striped hover responsive :items="modalItems">
            </b-table>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import QuorumSetDisplay from "./quorum-set-display.vue";
    import NodeList from "./node-list.vue";
    import NodeStatisticsListItem from "./node-statistics-list-item.vue";
    import Search from "./../search.vue";

    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Network, Node, QuorumSet} from "@stellarbeat/js-stellar-domain";

    import TomlConfigViewer from "./toml-config-viewer.vue";
    import {Modal} from "bootstrap-vue";

    @Component({
        name: "quorum-set-explorer",
        components: {
            Search,
            QuorumSetDisplay,
            TomlConfigViewer,
            NodeList,
            NodeStatisticsListItem
        },
    })
    export default class QuorumSetExplorer extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public selectedNode!: Node;

        public modalNode: Node | null = null;

        get numberOfValidatingTrustingNodes() {
            let vertex = this.network.graph.getVertex(this.selectedNode.publicKey);
            if (!vertex)
                return 0;
            return Array.from(this.network.graph.getParents(vertex)).filter(vertex => vertex.isValidating).length;
        }

        get modalItems() {
            if (!this.modalNode) {
                return [];
            }

            let item = JSON.parse(JSON.stringify(this.modalNode)); // clone it
            delete item.quorumSet;
            delete item.geoData;
            delete item.statistics;
            item = Object.assign(item, this.modalNode.geoData);
            item = Object.assign(item, this.modalNode.statistics);
            item.quorumSet = "";
            return [item];
        }

        public toggleNodeActive(node: Node) {
            this.$emit("node-toggle-active", node);
        }

        public toggleNodeValidating(node: Node) {
            this.$emit("node-toggle-validating", node);
        }

        public get selectedNodePartOfTransitiveQuorumSet() {
            return this.network.graph.networkTransitiveQuorumSet ? this.network.graph.isVertexPartOfNetworkTransitiveQuorumSet(this.selectedNode.publicKey) : false;
        }

        public get possibleValidatorsToAdd() {
            return this.network.nodes.filter((node: Node) =>
                node.isValidator
                && QuorumSet.getAllValidators(this.selectedNode.quorumSet).indexOf(node.publicKey) < 0);
        }

        public deleteValidatorFromQuorumSet(node: Node, quorumSet: QuorumSet) {
            this.$emit("quorumset-delete-validator", quorumSet, node);
        }

        public deleteInnerQuorumSet(innerQuorumSet: QuorumSet, fromQuorumSet?: QuorumSet) {
            if (fromQuorumSet === undefined) {
                fromQuorumSet = this.selectedNode.quorumSet;
            }

            this.$emit("quorumset-delete-inner-quorumset", innerQuorumSet, fromQuorumSet);
        }

        public addInnerQuorumSet(toQuorumSet: QuorumSet) {
            this.$emit("quorumset-add-inner-quorumset", toQuorumSet);
        }

        public addValidators(toQuorumSet: QuorumSet, validators: string[]) {
            this.$emit("quorumset-add-validators", toQuorumSet, validators);
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
            this.$emit("quorumset-edit-threshold", quorumSet, newThreshold);
        }

        public getFellowOrganizationNodes(node: Node) {
            return this.network.nodes
                .filter(fellowNode => fellowNode.organizationId === node.organizationId)
                .sort((a: Node, b: Node) => a.displayName.localeCompare(b.displayName));
        }

        public showModal(node: Node) {
            this.modalNode = node;
            this.$nextTick(function () {
                (this.$refs.modal as Modal).show();
            });
        }

        public navigateToOrg() {
            this.$router.push({
                name: "organization-details",
                params: {organizationId: this.selectedNode.organizationId}
            });
        }
    }
</script>

<style scoped>
    .full-validator-badge {
        margin-right: 5px !important;
    }

    .selected-node-title {
        margin-bottom: 5px;
    }

    .quorum-set-explorer {
        margin-top: 0px;
    }

    ul.tree {
        padding-left: 0px;
        margin-top: 8px;
    }

    .close:before {
        content: none !important;
    }


    .sb-badge {
        margin-right: 2px;
    }


    .dropdown {
        display: flex;
    }

    pre {
        margin-top: 2px;
        margin-bottom: 5px;
        padding: 5px 0px 5px 0px;
    }
    .public-key {
        color: #1997c6;
    }


</style>
<style>
    #node-details-modal {
        word-break: break-all;
    }

    .close::before {
        content: none !important;
    }
</style>