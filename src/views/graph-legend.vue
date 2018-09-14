<template>
    <div class="row" style="width: 100%">
        <div class="col-12">
            <div class="row">
                <div class="col-12 legend-link">

                    <a v-show="!showLegend" v-on:click.prevent.stop="showLegend=true" href="#">Show legend</a>
                    <a v-show="showLegend" v-on:click.prevent.stop="showLegend=false" href="#">Hide legend</a>
                </div>
            </div>
            <div v-show="showLegend" class="row text-center quorum-graph-legend">

                <div class="col-2 element selected-node">
                    Selected
                </div>
                <div class="col-2 element active-node">
                    Active
                </div>
                <div class="col-2 element inactive-node">
                    Inactive
                </div>

                <div class="col-2 element failing-node">
                    Failing
                </div>
                <div class="col-2 element incoming-connection">
                    Incoming Link
                </div>
                <div class="col-2 element outgoing-connection">
                    Outgoing Link
                </div>
            </div>

        </div>


    </div>

</template>

<script>
    export default {
        name: "graph-legend",
        data() {
            return {
                showLegend: false
            }
        }
    }
</script>

<style scoped>
    .quorum-graph-legend {
        margin-top: 20px;
        font-size: 0.7rem;
    }

    .quorum-graph-legend .element {
        border-radius: 5px;
        opacity: 0.8;

    }

    .quorum-graph-legend .connection {
        background: #74e1ff;
    }

    .quorum-graph-legend .incoming-connection {
        background: #1bc98e;
    }

    .quorum-graph-legend .outgoing-connection {
        background: #e4d836;
    }

    .quorum-graph-legend .active-node {
        background: #74e1ff;
    }

    .quorum-graph-legend .selected-node {
        background: yellow;
    }

    .quorum-graph-legend .inactive-node {
        background: #ECEBE4;
    }

    .quorum-graph-legend .failing-node {
        background: red;
    }

    .legend-link {
        font-size: 0.8rem;
        margin-bottom: 0px;
    }
</style>