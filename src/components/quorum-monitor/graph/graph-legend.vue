<template>
    <div class="row" style="width: 100%">
        <div class="col-12">
            <div class="row">
                <div class="col-12 legend-link mb-2">

                    <a v-show="!showLegend" v-on:click.prevent.stop="showLegend=true" href="#">Show legend</a>
                    <a v-show="showLegend" v-on:click.prevent.stop="showLegend=false" href="#">Hide legend</a>
                </div>
            </div>
            <div v-show="showLegend" class="row quorum-graph-legend mb-2">
                <div class="col-4 col-sm-2 d-flex">
                    <div class="element selected-node px-2 m-2">
                    </div>
                    <div >
                        Selected node
                    </div>
                </div>

                <div class="col-4 col-sm-2  d-flex">
                    <div class=" element active-node px-2 m-2"></div>
                    <div >
                        Active node
                    </div>
                </div>

                <div class="col-4 col-sm-2  d-flex">
                    <div class=" element inactive-node px-2 m-2"></div>
                    <div >
                        Inactive node
                    </div>
                </div>

                <div class="col-4 col-sm-2  d-flex">
                    <div class=" element failing-node px-2 m-2"></div>
                    <div >
                        Failing node
                    </div>
                </div>

                <div class="col-4 col-sm-2  d-flex">
                    <div class=" element incoming-connection px-2 m-2"></div>
                    <div >
                        Incoming Link
                    </div>
                </div>

                <div class="col-4 col-sm-2  d-flex">
                    <div class=" element outgoing-connection px-2 m-2"></div>
                    <div >
                        Outgoing Link
                    </div>
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
    .quorum-graph-legend .element {
        color: white;
        border-radius: 0px;
        width: 30px;
        height: 10px;
    }

    .quorum-graph-legend .connection {
        background: #1997c6;
    }

    .quorum-graph-legend .incoming-connection {
        background: #1bc98e;
    }

    .quorum-graph-legend .outgoing-connection {
        background: #e4d836;
    }

    .quorum-graph-legend .active-node {
        background: #1997c6;
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
    }
</style>