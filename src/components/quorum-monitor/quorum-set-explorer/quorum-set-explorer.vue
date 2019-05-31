<template>
    <div v-if="selectedNode" class="quorum-set-explorer">
        <fieldset class="rounded border p-2 mb-2">
            <legend  class="w-auto pl-3 pr-3 mb-0"><span v-if="selectedNode.isFullValidator" class="badge sb-badge badge-success full-validator-badge">
                        <i class="fe fe-shield"></i>
                    </span>{{selectedNode.displayName | truncate(26)}}</legend>
        <div class="row">
            <div class="col-sm-12">

                <!--h3 class="selected-node-title">
                    <span v-if="selectedNode.isFullValidator" class="badge sb-badge badge-success full-validator-badge">
                        <i class="fe fe-shield"></i>
                    </span>{{selectedNode.displayName | truncate(27)}}
                </h3!-->
                <span class="badge sb-badge"
                      v-bind:class="[selectedNode.isFullValidator || selectedNode.isValidator ? 'badge-success ' : 'badge-default']"
                >
                    {{selectedNode.isFullValidator ? 'Full Validator' :
                    selectedNode.isValidator ? 'Validator' : 'Watcher Node'}}
                </span>
                <span class="badge sb-badge"
                      v-bind:class="[selectedNode.active ? 'badge-primary ' : 'badge-default']"
                >{{selectedNode.active ? 'Active' : 'Inactive'}}
                </span>
                <span v-if="selectedNode.isValidating"
                      class="badge sb-badge badge-success"
                >Validating
                </span>
                <span v-if="selectedNode.active && selectedNode.isValidator && !selectedNode.isValidating"
                      class="badge sb-badge badge-danger"
                >Not validating
                </span>
                <span v-if="selectedNode.quorumSet.hasValidators() && network.isQuorumSetFailing(this.selectedNode)"
                      class="badge sb-badge badge-danger"
                >Quorumset not reaching threshold
                </span>

                <span class="badge badge-default sb-badge">{{selectedNode.versionStr}}</span>
                <pre><code data-lang="html">{{selectedNode.publicKey}}</code></pre>



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
        <div v-show="selectedNode.quorumSet.hasValidators()" class="row">
            <div class="col-sm-12">
                <NodeList
                        :nodes="network.getTrustingNodes(selectedNode) ? network.getTrustingNodes(selectedNode) : []"
                        :network="network"
                        v-on:node-toggle-active="toggleNodeActive"
                        v-on:node-toggle-validating="toggleNodeValidating"
                        v-on:node-show-modal="showModal"
                >

                </NodeList>
            </div>

        </div>
            <div class="row">
                <div class="col-sm-12">
                    <NodeStatistics :node="selectedNode" :network="network"></NodeStatistics>
                </div>
            </div>
            <b-button-group size="md" class="mt-1">
                <b-button title="Show info"
                          v-on:click="showModal(selectedNode)">
                    Show info <i class="fe fe-info"/>
                </b-button>
                <b-dropdown size="sm" variant="secondary" right id="more" no-caret
                >
                    <template slot="button-content">
                        Simulation options
                        <i class="fe fe-more-vertical"></i>
                    </template>
                    <b-dropdown-item v-on:click="$emit('node-toggle-validating', selectedNode)">
                        <i class="dropdown-icon fe fe-activity"></i>
                        {{selectedNode.isValidating ? 'Stop validating' : 'Start validating'}}
                    </b-dropdown-item>
                    <b-dropdown-item v-on:click="$emit('node-toggle-active', selectedNode)">
                        <i class="dropdown-icon fe fe-power"></i>
                        {{selectedNode.active ? 'Disable' : 'Enable'}}
                    </b-dropdown-item>
                </b-dropdown>
                <!--button v-if="selectedNode.isValidator" type="button" class="btn btn-sm" title="toggle validating"
                        v-on:click.prevent.stop="$emit('node-toggle-validating', selectedNode)"
                        v-bind:class="[selectedNode.isValidating ? 'btn-success' : 'btn-danger']">
                    <i class="fe fe-activity"/> {{selectedNode.isValidating ? 'Stop validating' : 'Start validating'}}
                </button>
                <button type="button" class="btn btn-sm" title="(de-)activate node"
                        v-on:click.prevent.stop="$emit('node-toggle-active', selectedNode)"
                        v-bind:class="[selectedNode.active ? 'btn-primary' : 'btn-secondary']">
                    <i class="fe fe-power"/> {{selectedNode.active ? 'Disable node' : 'Enable node'}}
                </button!-->

            </b-button-group>

        <b-modal v-if="modalNode"
                 ok-title="Close" size="lg" ok-only id="node-details-modal" ref="modal"
                 v-bind:title="modalNode.displayName">
            <b-table stacked striped hover responsive :items="modalItems">
            </b-table>
        </b-modal>
        </fieldset>

    </div>
</template>

<script lang="ts">
    import QuorumSetDisplay from "./quorum-set-display.vue";
    import NodeList from "./node-list.vue";
    import NodeStatistics from "./node-statistics.vue";
    import Search from "./../search.vue";

    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Network, Node, QuorumSet} from "@stellarbeat/js-stellar-domain";
    import {Modal} from "bootstrap-vue";

    import TomlConfigViewer from "./toml-config-viewer.vue";

    @Component({
        name: "quorum-set-explorer",
        components: {
            Search,
            QuorumSetDisplay,
            TomlConfigViewer,
            NodeList,
            NodeStatistics
        },
    })
    export default class QuorumSetExplorer extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public selectedNode!: Node;

        public modalNode: Node | null = null;

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

        public get possibleValidatorsToAdd() {
            return this.network.nodes.filter((node: Node) =>
                node.active
                && node.isValidator
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

        public showModal(node: Node) {
            this.modalNode = node;
            this.$nextTick(function () {
                (this.$refs.modal as Modal).show();
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


</style>
<style>
    #node-details-modal {
        word-break: break-all;
    }

    .close::before {
        content: none !important;
    }
</style>