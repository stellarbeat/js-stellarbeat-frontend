<template>
    <div>
        <div class="row">
            <div class="col-sm-12">
                <h4 class="node-details-title">Selected node: {{selectedNode.displayName | truncate(30)}}
                    <div class="btn-toolbar fa-pull-right" role="toolbar" aria-label="Toolbar with button groups">
                        <div class="btn-group btn-group-sm" role="group" aria-label="actions">
                            <button type="button" class="node-info-btn btn btn-sm btn-secondary" title="Show info"
                                    v-on:click="showModal(selectedNode)">
                                <i class="fe fe-info"/>
                            </button>
                            <button type="button" class="btn btn-sm" title="(de-)activate node"
                                    v-on:click.prevent.stop="$emit('node-toggle-active', selectedNode)"
                                    v-bind:class="[selectedNode.active ? 'btn-primary' : 'btn-secondary']">
                                <i class="fe fe-power"/>
                            </button>
                        </div>
                    </div>
                </h4>
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

    import TomlConfigViewer from './toml-config-viewer.vue'

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

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold:number) {
            this.$emit('quorumset-edit-threshold', quorumSet, newThreshold);
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
    ul.tree {
        padding-left: 0px;
    }

    .btn-group {
        margin-left: 5px;
    }

    .close:before {
        content: none !important;
    }

    .btn-toolbar {
        float: right;
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