<template>
    <div>
        <div>
            <h4 class="node-details-title">Selected node: {{selectedNode.displayName | truncate(30)}}
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
                        <button type="button" class="btn btn-sm btn-secondary" title="Show info"
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
                <QuorumSet :quorumSet="selectedNode.quorumSet"
                           :network="network"
                           :root="true"
                           v-on:node-toggle-active="toggleNodeActive"
                           v-on:node-show-modal="showModal"
                           >
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
    import QuorumSet from './quorum-set.vue';
    import Search from './../search.vue';

    export default {
        name: "quorum-set-explorer",
        components: {
            QuorumSet,
            Search
        },
        props: {
            network: {
                type: Object
            },
            selectedNode: {
                type: Object
            }
        },
        data() {
            return {
                modalNode: {}
            }
        },
        computed: {
            modalItems: function() {
                if(!this.selectedNode) {
                    return [];
                }
                let item = JSON.parse(JSON.stringify(this.selectedNode)); //clone it
                delete item.quorumSet;
                delete item.geoData;
                delete item.statistics;
                item = Object.assign(item, this.selectedNode.geoData);
                item = Object.assign(item, this.selectedNode.statistics);
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
            onNodeCenter: function (node) {
                //this.$emit("center-node", node);
            }
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
    .btn-toolbar{
        float:right;
    }

</style>
<style>
    #node-details-modal {
        word-break: break-all;
    }
</style>