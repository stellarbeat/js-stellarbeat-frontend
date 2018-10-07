<template>
    <div class="card">
        <div v-if="node !== null" class="card-body">
            <h5 class="card-title node-details-title" data-toggle="tooltip"
                v-bind:title="node.displayName">{{node.displayName | truncate(20)}}<span class="fa-pull-right">
                                        <button type="button" class="btn btn-sm btn-secondary" v-on:click="showModal(node)">
                                            <font-awesome-icon size="xs" icon="info"/>
                                        </button>
                                        <button type="button" class="btn btn-sm"
                                                v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                                                v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
                                            <font-awesome-icon size="xs" icon="power-off"/>
                                        </button>
                                   </span></h5>

            <ul class="tree list-group list-group-flush">
                <QuorumSet :quorumSet="node.quorumSet"
                           :network="network"
                           :root="true"
                           v-on:node-toggle-active="toggleNodeActive"
                           v-on:node-show-modal="showModal">
                </QuorumSet>
            </ul>
        </div>
        <div v-else-if="node === null" class="card-body">
            <h5 class="card-title">Manual</h5>
            <ul>
                <li>Click and drag on the Graph to pan</li>
                <li>Scroll on the Graph to zoom</li>
                <li>Search or click on a node to select it</li>
                <li>Click on the legend on the bottom on the graph to see the color codes</li>
                <li>Links are only shown between active, non-failing nodes</li>
                <li>Clustered nodes have fuller links and are closer together in the graph</li>
                <li>Press the info button in the selected node details for a complete list of the node details</li>
                <li>
                    Toggle the on/off button in the selected node details to activate/deactivate the node and see the effects on the network
                </li>
            </ul>
        </div>
        <div class="modal" id="node-details-modal" ref="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{modalNode.displayName}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <dl>
                            <dt>public key</dt>
                            <dd>{{modalNode.publicKey}}</dd>
                        </dl>
                        <dl>
                            <dt>ip:port</dt>
                            <dd>{{modalNode.key}}</dd>
                        </dl>
                        <dl>
                            <dt>host</dt>
                            <dd>{{modalNode.host}}</dd>
                        </dl>
                        <dl>
                            <dt>Version</dt>
                            <dd>{{modalNode.versionStr}}</dd>
                        </dl>
                        <dl>
                            <dt>ledger version</dt>
                            <dd>{{modalNode.ledgerVersion}}</dd>
                        </dl>
                        <dl>
                            <dt>overlay version</dt>
                            <dd>{{modalNode.overlayVersion}}</dd>
                        </dl>
                        <dl>
                            <dt>date discovered</dt>
                            <dd>{{modalNode.dateDiscovered}}</dd>
                        </dl>

                        <dl>
                            <dt>date updated</dt>
                            <dd>{{modalNode.dateUpdated}}</dd>
                        </dl>

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    const QuorumSet = require('../quorum-set.vue');

    export default {
        name: "node-explorer",
        components: {
            QuorumSet
        },
        props: {
            node: {
                type: Object
            },
            network: {
                type: Object
            }
        },
        data() {
            return {
                modalNode: {}
            }
        },
        methods: {
            toggleNodeActive: function (node) {
                this.$emit("node-toggle-active", node);
            },
            showModal: function (node) {
                this.modalNode = node;
                $('#node-details-modal').modal('show');
            }
        },
        mounted() {
            $(function () {
                $('.node-details-title').tooltip({
                    "placement": "left"
                });
            });
        }
    }
</script>

<style scoped>
    ul.tree {
        padding-left: 0px;
    }
</style>