<template xmlns="http://www.w3.org/1999/html">
    <div class="graph row">

        <div class="col-xs-12" style="width: 100%">
            <div v-show="isLoading" class="fa-5x" style="text-align: center;">
                <font-awesome-icon size="xs" icon="spinner" spin pulse/>
            </div>
            <svg class="graph" xmlns="http://www.w3.org/2000/svg"
                 ref="graphSvg"
                 width="100%"
                 height="600px"
            >
                <g>
                    <GraphLink v-show="!isLoading" v-for="link in graphLinks" :graphLink="link"
                               :selectedNode="selectedNode"></GraphLink>
                    <GraphNode v-show="!isLoading" v-for="node in graphNodes" :node="node" :selectedNode="selectedNode"
                               :network="network" :targetNodes="targetNodes" :sourceNodes="sourceNodes"
                               v-on:node-selected="onNodeSelected"></GraphNode>
                </g>

            </svg>
        </div>
    </div>

</template>

<script>
    //The svg viewbox takes sets the x and y coordinates to the center
    const d3 = require('d3');
    const GraphNode = require("./graph-node.vue");
    const GraphLink = require("./graph-link.vue");
    const GraphNodeEntity = require("./../entities/graph-node");
    const svgPanZoom = require("svg-pan-zoom");
    const Network = require("./../entities/network");
    const work = require('webworkify');
    const computeGraphWorker = work(require('./../workers/compute-graph.js'));


    export default {
        name: "graph",

        components: {
            GraphNode,
            GraphLink
        },
        data() {
            return {
                simulation: {},
                simulationNodes: {},
                graphNodes: this.network.nodes.map(node => new GraphNodeEntity(node.publicKey, node)), //todo couldn't we just use the network.nodes for simpler code?
                graphLinks: this.network.links.map(link => {
                    return {
                        "source": link.source,
                        "target": link.target,
                        "originLink": link,
                        "coordinates": {
                            "x1": undefined,
                            "y1": undefined,
                            "x2": undefined,
                            "y2": undefined,
                        }
                    }
                }),
                panZoom: {},
                isLoading: true,
                graphInitialized: false
            }
        },
        props: {
            network: {
                type: Object
            },
            selectedNode: {
                type: Object
            }
        },
        computed: {
            sourceNodes: function () {
                return this.graphLinks
                    .filter(link => link.target.originNode === this.selectedNode)
                    .map(link => link.source.originNode);
            },
            targetNodes: function () {
                return this.graphLinks
                    .filter(link => link.source.originNode === this.selectedNode)
                    .map(link => link.target.originNode);
            }
        },
        methods: {
            onNodeSelected: function (graphNode) {
                this.$emit("node-selected", graphNode.originNode);
            },
            restartSimulation: function () {
                this.graphLinks = this.network.links.map(link => {
                        return {
                            "source": link.source,
                            "target": link.target,
                            "originLink": link,
                            "coordinates": {
                                "x1": undefined,
                                "y1": undefined,
                                "x2": undefined,
                                "y2": undefined,
                            }
                        }});
                this.computeGraph();
            },
            computeGraph: function() {
                this.isLoading = true;
                //separate simnodes to avoid slow rendering
                let simulationNodes = this.graphNodes.map((node, index) => {
                    return {
                        'publicKey': node.publicKey,
                        'x': node.x,
                        'y': node.y,
                        'fx': node.fx,
                        'fy': node.fy,
                        'index': index
                    }
                });

                let simulationLinks = this.graphLinks.map((link, index) => {
                    return {
                        'source': link.source.publicKey,
                        'target':link.target.publicKey,
                        'isClusterLink': link.originLink.isClusterLink,
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
            computeGraphWorker.onmessage = function(event) {
                switch (event.data.type) {
                    case "tick": {
                        console.log(100 * event.data.progress + "%");
                    }
                        break;
                    case "end": {
                        event.data.nodes.forEach(
                            node => {
                                this.graphNodes[node.index].x = node.x;
                                this.graphNodes[node.index].y = node.y;
                            }
                        );
                        event.data.links.forEach(
                            link => {
                                this.graphLinks[link.index].coordinates = {
                                    "x1": link.source.x,
                                    "y1": link.source.y,
                                    "x2": link.target.x,
                                    "y2":  link.target.y
                                } //update in one movement to avoid rerendering after every individual coordinate set (e.g. x1=..)
                            }
                        );
                        this.isLoading = false;
                        if(!this.graphInitialized){
                            this.panZoom = svgPanZoom(this.$refs.graphSvg,
                                {  zoom: 2,
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


        }
    }
</script>

<style scoped>
    svg.graph {
        height: inherit;
        width: 100%;
    }
</style>