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

        <b-modal
                ok-title="Close" size="lg" ok-only id="node-details-modal" ref="modal" v-bind:title="modalNode.displayName">
            <b-table stacked striped hover responsive :items="modalItems" >
            </b-table>
        </b-modal>

    </div>
</template>

<script>
    import QuorumSet from '../quorum-set.vue';
    import NodeExplorerBreadcrumbs from './node-explorer-breadcrumbs.vue';
    import Search from './../search.vue';

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
        computed: {
            modalItems: function() {
                if(!this.node) {
                    return [];
                }
                let item = JSON.parse(JSON.stringify(this.node)); //clone it
                delete item.quorumSet;
                delete item.geoData;
                delete item.statistics;
                item = Object.assign(item, this.node.geoData);
                item = Object.assign(item, this.node.statistics);
                item.quorumSet = '';
                return [item];
            }
        },
        methods: {
            toggleNodeActive: function (node) {
                this.$emit("node-toggle-active", node);
            },
            showModal: function (node) {
                this.modalNode = node;
                this.$refs.modal.show();
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

</style>
<style>
    #node-details-modal {
        word-break: break-all;
    }
</style>