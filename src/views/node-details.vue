<template>
    <div class="card">
        <div v-if="node !== null" class="card-body">
            <h5 class="card-title node-details-title" data-toggle="tooltip"
                v-bind:title="node.displayName">{{node.displayName | truncate(20)}}<span class="fa-pull-right">
                                        <button type="button" class="btn btn-sm btn-secondary" data-toggle="modal" data-target="#node-details-modal">
                                            <font-awesome-icon size="xs" icon="info"/>
                                        </button>
                                        <button type="button" class="btn btn-sm"
                                                v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                                                v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
                                            <font-awesome-icon size="xs" icon="power-off"/>
                                        </button>
                                   </span></h5>


            <QuorumSet :quorumSet="node.quorumSet"
                       :network="network"></QuorumSet>
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
                <li>Toggle the on/off button in the selected node details to activate/deactivate the node and see the effects on the network</li>
            </ul>
        </div>
        <div v-if="node !== null" class="modal" id="node-details-modal" tabindex="-1" role="dialog">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{node.displayName}}</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>Todo: layout</p>
                        <div v-for="(value, key) in node">
                            {{ key }}: {{ value }}
                        </div>
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
    const QuorumSet = require('./quorum-set.vue');

    export default {
        name: "node-details",
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

</style>