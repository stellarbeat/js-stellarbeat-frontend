<template>
    <div class="quorum-set-explorer">
        <div class="row">
            <div class="col-sm-12">
                <h3 class="selected-node-title">
                    <span v-if="selectedNode.isFullValidator" class="badge sb-badge badge-success full-validator-badge">
                        <i class="fe fe-shield"></i>
                    </span>{{selectedNode.displayName | truncate(27)}}
                </h3>
                <span class="badge sb-badge"
                      v-bind:class="[selectedNode.isFullValidator || selectedNode.isValidator ? 'badge-success ' : 'badge-default']"
                >
                    {{selectedNode.isFullValidator ? 'Full Validator' :
                    selectedNode.isValidator ? 'Basic Validator' : 'Watcher Node'}}
                </span>
                <span class="badge sb-badge"
                      v-bind:class="[selectedNode.active ? 'badge-primary ' : 'badge-default']"
                >{{selectedNode.active ? 'Active' : 'Inactive'}}
                </span>
                <span v-if="selectedNode.quorumSet.hasValidators() && network.isQuorumSetFailing(this.selectedNode.quorumSet)" class="badge sb-badge badge-danger"
                >Failing
                </span>

                <span class="badge sb-badge"
                      v-bind:class="[selectedNode.statistics.activeRating * 20 === 100 ? 'badge-success ' : 'badge-warning']"
                >Availability
                    {{selectedNode.statistics.activeRating * 20 + '%'}}
                </span>


                <span class="badge badge-default sb-badge">{{selectedNode.versionStr}}</span>
                <pre><code class="language-html" data-lang="html">{{selectedNode.publicKey}}</code></pre>

                <div class="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
                    <div class="btn-group btn-group-sm" role="group" aria-label="actions">
                        <button type="button" class="node-info-btn btn btn-sm btn-secondary" title="Show info"
                                v-on:click="showModal(selectedNode)">
                            <i class="fe fe-info"/> Show info
                        </button>
                        <button type="button" class="btn btn-sm" title="(de-)activate node"
                                v-on:click.prevent.stop="$emit('node-toggle-active', selectedNode)"
                                v-bind:class="[selectedNode.active ? 'btn-primary' : 'btn-secondary']">
                            <i class="fe fe-power"/> {{selectedNode.active ? 'Disable node' : 'Enable node'}}
                        </button>
                    </div>
                </div>
                <div v-show="selectedNode.quorumSet.hasValidators()">
                    <ul class="tree list-group list-group-flush">
                        <QuorumSetDisplay :quorumSet="selectedNode.quorumSet"
                                          :network="network"
                                          :root="true"
                                          v-on:node-toggle-active="toggleNodeActive"
                                          v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                                          v-on:node-show-modal="showModal"
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
                        v-on:node-show-modal="showModal"
                >

                </NodeList>
            </div>
        </div>
        <div v-show="selectedNode.quorumSet.hasValidators()" class="row">
            <div class="col-sm-12">
                <TomlConfigViewer :node="selectedNode" :network="network"></TomlConfigViewer>
            </div>
        </div>
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
            NodeList
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

    .badge-primary {
        background: #1997c6
    }

    .btn-primary {
        background: #1997c6;
        border-color: #1997c6;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #1a85ad;
        border-color: #1a85ad;
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