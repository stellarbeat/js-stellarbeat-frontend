<template>
    <div class="row">
        <div class="col-sm-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Total nodes</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Total nodes in the network</h6>
                    <p class="card-text">{{totalNodes}}</p>
                </div>
            </div>
        </div>
        <div class="col-sm-3">

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Active nodes</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Nodes we can connect to</h6>
                    <p class="card-text">{{numberOfActiveNodes}}</p>
                </div>
            </div>
        </div>
        <div class="col-sm-3">

            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Failing nodes</h5>
                    <h6 class="card-subtitle mb-2 text-muted">Not meeting quorumset threshold</h6>
                    <p class="card-text">{{numberOfFailingNodes}} of {{numberOfNodesWithQuorumSets}} active nodes with
                        quorumsets</p>
                </div>
            </div>
        </div>
        <div class="col-sm-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Network Health</h5>
                    <p class="card-text">Quorum Intersection: In Progress</p>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "statistics",
        props: {
            network: {
                type: Object
            }
        },
        computed: {
            totalNodes: function () {
                return this.network.nodes.length;
            },
            numberOfActiveNodes: function () {
                return this.network.nodes.filter(node => node.active).length;
            },
            numberOfFailingNodes: function () {
                return this.network.failingNodes.length;
            },
            numberOfNodesWithQuorumSets: function () {
                return this.network.nodes.filter(node => node.active && node.quorumSet.hasValidators()).length;
            }
        },
        mounted() {
        }

    }
</script>

<style scoped>

</style>