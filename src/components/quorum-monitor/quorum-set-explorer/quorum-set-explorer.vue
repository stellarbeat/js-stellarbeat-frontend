<template>
    <div class="quorum-set-explorer">
        <div class="row">
            <div class="col-sm-12">
                <h3 class="selected-node-title" data-toggle="tooltip" data-placement="top" title="Tooltip on top">
                    {{selectedNode.displayName | truncate(28)}}
                    <!--b-dropdown right id="more" size="sm" text="More" class="p-0 m-0 float-right" no-caret>
                        <template slot="button-content">
                            <i class="fe fe-more-vertical"></i>
                        </template>
                        <b-dropdown-item v-on:click="showModal(selectedNode)">
                            <i class="dropdown-icon fe fe-info"></i>
                            Info
                        </b-dropdown-item>
                        <b-dropdown-item v-on:click="$emit('node-toggle-active', selectedNode)">
                            <i class="dropdown-icon fe fe-power"></i>
                            {{selectedNode.active ? 'Disable' : 'Enable'}}
                        </b-dropdown-item>
                    </b-dropdown!-->
                </h3>

                <span class="badge sb-badge"
                      v-bind:class="[selectedNode.active ? 'badge-primary ' : 'badge-default']"
                >{{selectedNode.active ? 'Active' : 'Inactive'}}
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
        <div class="row">
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
            TomlConfigViewer
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
        background: #1997c6
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