<template xmlns="http://www.w3.org/1999/html">
    <div class="graph row">

        <div class="col-xs-12" style="width: 100%">
            <div v-bind:class="dimmerClass">
                <div class="loader"></div>
                <div class="dimmer-content">
                    <svg class="graph" xmlns="http://www.w3.org/2000/svg"
                         ref="graphSvg"
                         width="100%"
                         height="600px"
                    >
                        <g class="svg-pan-zoom_viewport">
                            <GraphLink v-if="graphInitialized" v-for="link in network.links" :link="link"
                                       :selectedNode="selectedNode" :key="link.id"></GraphLink>
                            <GraphNode v-if="graphInitialized" v-for="node in network.nodes" :key="node.publicKey" :node="node"
                                       :selectedNode="selectedNode"
                                       :network="network" :targetNodes="targetNodes" :sourceNodes="sourceNodes"
                                       v-on:node-selected="onNodeSelected"></GraphNode>
                        </g>

                    </svg>
                </div>
            </div>
        </div>
    </div>

</template>

<script>
    /* @flow */
    import GraphNode from "./graph-node.vue";
    import GraphLink from "./graph-link.vue";

    const svgPanZoom = require("svg-pan-zoom");
    //const work = require('webworkify');
    const ComputeGraphWorker = require('./../workers/compute-graph.worker.js');
    const computeGraphWorker = new ComputeGraphWorker();

    export default {
        name: "graph",

        components: {
            GraphNode,
            GraphLink
        },
        data() {
            return {
                selectedNode: null,
                simulation: {},
                simulationNodes: {},
                panZoom: {},
                isLoading: true,
                graphInitialized: false,
                loadingProgress: 0
            }
        },
        props: {
            network: {
                type: Object
            },
            centerNode: {
                type: Object
            }
        },
        watch: {
            centerNode: function (node) {
                let height = this.panZoom.getSizes().height;
                let width = this.panZoom.getSizes().width;
                let zoom = this.panZoom.getSizes().realZoom;
                let realNodeX = -node.x * zoom + width / 2;
                let realNodeY = -node.y * zoom + height / 2;
                this.panZoom.pan({x: realNodeX, y: realNodeY});
            },
            '$route'(to, from) {
                this.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
            }

        },
        computed: {
            progressBarWidth: function () {
                return "width: " + this.loadingProgress + '%';
            },
            sourceNodes: function () {
                return this.network.links
                    .filter(link => link.target === this.selectedNode)
                    .map(link => link.source);
            },
            targetNodes: function () {
                return this.network.links
                    .filter(link => link.source === this.selectedNode)
                    .map(link => link.target);
            },
            dimmerClass: function () {
                return {
                    'dimmer': true,
                    'active': this.isLoading
                }
            }
        },
        methods: {
            onNodeSelected: function (node) {
                this.$emit("node-selected", node);
            },
            restartSimulation: function () {
                this.computeGraph();
            },
            computeGraph: function () {
                this.isLoading = true;
                //separate simnodes to avoid slow rendering
                let simulationNodes = this.network.nodes.map((node, index) => {
                    return {
                        'publicKey': node.publicKey,
                        'x': node.x,
                        'y': node.y,
                        'index': index
                    }
                });

                let simulationLinks = this.network.links.map((link, index) => {
                    return {
                        'source': link.source.publicKey,
                        'target': link.target.publicKey,
                        'isClusterLink': link.isClusterLink,
                        'index': index
                    }
                });

                computeGraphWorker.postMessage({
                    nodes: simulationNodes,
                    links: simulationLinks
                });

            }

        },
        created() {//todo web worker
            this.network.nodes.forEach(node => {
                this.$set(node, 'x', undefined);
                this.$set(node, 'y', undefined);
            }); //trigger reactive changes on newly added x and y coordinates

            computeGraphWorker.onmessage = function (event) {
                switch (event.data.type) {
                    case "tick": {
                        let newLoadingProgress = Math.round(event.data.progress * 100);
                        //if(newLoadingProgress % 25 === 0)
                        this.loadingProgress = newLoadingProgress;
                    }
                        break;
                    case "end": {
                        event.data.nodes.forEach(
                            node => {
                                this.network.nodes[node.index].x = node.x;
                                this.network.nodes[node.index].y = node.y;
                            }
                        );
                        this.isLoading = false;
                        if (!this.graphInitialized) {
                            this.panZoom = svgPanZoom(this.$refs.graphSvg,
                                {
                                    mouseWheelZoomEnabled: false,
                                    zoom: 2,
                                    minZoom: 0.5
                                    , maxZoom: 10
                                    , fit: false
                                    , contain: false
                                    , center: true,
                                    controlIconsEnabled: true
                                });
                            this.graphInitialized = true;
                            this.panZoom.zoomBy(2);
                        }
                    }
                        break;
                }
            }.bind(this);
            this.computeGraph();

        },
        mounted() {
            if (this.network.getNodeByPublicKey(this.$route.params.publicKey)) {
                this.selectedNode = this.network.getNodeByPublicKey(this.$route.params.publicKey);
            }

        }
    }
</script>

<style scoped>
    svg.graph {
        height: inherit;
        width: 100%;
        border-right: 1px solid rgba(0, 40, 100, 0.12);
    }

    .progress {
        height: 20px;
        margin-top: 10%;
        margin-left: 20%;
        margin-right: 20%
    }

    .progress-bar {
        -webkit-transition: none !important;
        transition: none !important;
        background-color: #1997c6;
        opacity: 0.6;
    }

    .dimmer.active .dimmer-content {
        opacity: 0.4;
    }

</style>