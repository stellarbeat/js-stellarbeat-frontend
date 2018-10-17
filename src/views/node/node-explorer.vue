<template>
    <div>
        <div>
            <h4 class="node-details-title"
                v-bind:title="node.displayName">{{node.displayName | truncate(30)}}
                <div class="btn-toolbar fa-pull-right" role="toolbar" aria-label="Toolbar with button groups">
                    <!--div class="btn-group btn-group-sm" role="group" aria-label="breadcrumb">
                        <button type="button" class="btn btn-secondary" disabled>
                            <font-awesome-icon size="sm" icon="arrow-circle-left"/>
                        </button>
                        <button type="button" class="btn btn-secondary" disabled>
                            <font-awesome-icon size="sm" icon="arrow-circle-right"/>
                        </button>
                    </div!-->
                    <div class="btn-group btn-group-sm" role="group" aria-label="actions">
                        <button type="button" class="btn btn-sm btn-secondary"
                                v-on:click="showModal(node)">
                            <font-awesome-icon size="xs" icon="info"/>
                        </button>
                        <button type="button" class="btn btn-sm"
                                v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                                v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
                            <font-awesome-icon size="xs" icon="power-off"/>
                        </button>
                    </div>
                </div>
            </h4>
            <ul class="tree list-group list-group-flush">
                <QuorumSet :quorumSet="node.quorumSet"
                           :network="network"
                           :root="true"
                           v-on:node-toggle-active="toggleNodeActive"
                           v-on:node-show-modal="showModal"
                           v-on:node-selected="onNodeSelected">
                </QuorumSet>
            </ul>
        </div>

        <div class="modal" id="node-details-modal" ref="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">

                    <div class="modal-header">
                        <h5 class="modal-title">{{modalNode.displayName}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
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
    const NodeExplorerBreadcrumbs = require('./node-explorer-breadcrumbs.vue');
    const Search = require('./../search.vue');

    export default {
        name: "node-explorer",
        components: {
            QuorumSet,
            Search,
            NodeExplorerBreadcrumbs
        },
        props: {
            network: {
                type: Object
            }
        },
        data() {
            return {
                node: null,
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
            },
            onNodeSelected: function (node) {
                this.$emit("center-node", node);
            },
            onNodeCenter: function (node) {
                this.$emit("center-node", node);
            },
        },
        watch: {
            '$route'(to, from) {
                this.node = this.network.getNodeByPublicKey(to.params.publicKey);
            }
        },
        created() {
            if (this.$route.params.publicKey && this.network.getNodeByPublicKey(this.$route.params.publicKey))
                this.node = this.network.getNodeByPublicKey(this.$route.params.publicKey);
            else
                this.node = this.network.nodes[0];
        },
        mounted() {
            $(function () {
                /*$('.node-details-title').tooltip({
                    "placement": "left"
                });*/
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
</style>