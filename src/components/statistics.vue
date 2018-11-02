<template>
    <div class="row row-cards row-deck">
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <div class="text-right text-gray">
                        <i id="totalNodesTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="totalNodesTooltip" placement="top">
                        Total number of nodes crawled that supplied us with a public key.
                    </b-tooltip>

                    <div class="h1 m-0">{{totalNodes}}</div>
                    <div class="text-muted mb-4">Nodes</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <div class="text-right text-gray">
                        <i id="activeNodesTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="activeNodesTooltip" placement="top">
                        Number of nodes that were active at least one time in the latest x crawls.
                    </b-tooltip>
                    <div class="h1 m-0">{{numberOfActiveNodes}}</div>
                    <div class="text-muted mb-4">Active Nodes</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <div class="text-right text-gray">
                        <i id="ActiveValidatorsTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="ActiveValidatorsTooltip" placement="top">
                        Number of nodes that supplied us with quorumset configurations and were active at least one time in the latest x crawls.
                    </b-tooltip>
                    <div class="h1 m-0">{{numberOfNodesWithQuorumSets}}</div>
                    <div class="text-muted mb-4">Active Validators</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body p-3 text-center">
                    <div class="text-right text-gray">
                        <i id="FailingValidatorsTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="FailingValidatorsTooltip" placement="top">
                        Number of active validators that don't reach their quorumset thresholds.
                    </b-tooltip>
                    <div class="h1 m-0">{{numberOfFailingNodes}}</div>
                    <div class="text-muted mb-4">Failing Validators</div>
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