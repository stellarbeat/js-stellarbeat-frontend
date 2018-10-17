<template>
    <div class="row row-cards">
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <!--div class="text-right text-green">
                        6%
                        <i class="fe fe-chevron-up"></i>
                    </div!-->
                    <div class="h1 m-0">{{totalNodes}}</div>
                    <div class="text-muted mb-0">Nodes</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <div class="text-right text-green">
                    </div>
                    <div class="h1 m-0">{{numberOfActiveNodes}}</div>
                    <div class="text-muted mb-0">Active Nodes</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <!--div class="text-right text-green">
                        6%
                        <i class="fe fe-chevron-up"></i>
                    </div!-->
                    <div class="h1 m-0">{{numberOfNodesWithQuorumSets}}</div>
                    <div class="text-muted mb-0">Active Validators</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <!--div class="text-right text-green">
                        6%
                        <i class="fe fe-chevron-up"></i>
                    </div!-->
                    <div class="h1 m-0">{{numberOfFailingNodes}}</div>
                    <div class="text-muted mb-0">Failing Validators</div>
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