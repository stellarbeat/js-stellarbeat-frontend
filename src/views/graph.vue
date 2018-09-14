<template xmlns="http://www.w3.org/1999/html">
    <div class="graph row">

        <div class="col-xs-12" style="width: 100%">

            <svg class="graph" xmlns="http://www.w3.org/2000/svg"
                 ref="graphSvg"
                 width="100%"
                 height="600"
            >
                <g>
                    <GraphLink v-for="link in graphLinks" :graphLink="link"
                               :selectedNode="selectedNode"></GraphLink>
                    <GraphNode v-for="node in graphNodes" :node="node" :selectedNode="selectedNode"
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

    export default {
        name: "graph",

        components: {
            GraphNode,
            GraphLink
        },
        data() {
            return {
                simulation: {},
                graphNodes: this.network.nodes.map(node => new GraphNodeEntity(node.publicKey, node)),
                graphLinks: this.network.links.map(link => {
                    return {
                        "source": link.source,
                        "target": link.target,
                        "originLink": link,
                    }
                }),
                panZoom: {}
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
                        "originLink": link
                    }
                });
                this.simulation.force("link")
                    .links(this.graphLinks);
                this.simulation.alpha(1);
                this.simulation.restart();
            }

        },
        created() {//todo web worker
            //separate simnodes to avoid slow rendering
            let simulationNodes = this.graphNodes.map(node => {
                return {
                    'publicKey': node.publicKey,
                    'x': node.x,
                    'y': node.y,
                    'fx': node.fx,
                    'fy': node.fy,
                    'origNode': node
                }
            });

            let simulationNodesMap = new Map(simulationNodes
                .map(node => [node.publicKey, node])
            );

            /*let simulationLinks = this.links.map(link => {
                return {
                    'source': simulationNodesMap.get(link.source.publicKey),
                    'target': simulationNodesMap.get(link.target.publicKey),
                    'origLink': link
                }
            });*/

            this.simulation = d3.forceSimulation(this.graphNodes)
                .force('charge', d3.forceManyBody().strength(d => {
                    return -150;
                }))
                .force('link', d3.forceLink(this.graphLinks).strength(function (link) {
                    if (link.originLink.isClusterLink) {
                        return 0.05;
                    } else {
                        return 0.001;
                    }
                }).id(function (d) {
                    return d.publicKey;
                }))
                .force('x', d3.forceX())
                .force('y', d3.forceY());
            //.stop();
            return;
            d3.timeout(function () { //see https://bl.ocks.org/mbostock/1667139
                //loading.remove();

                // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
                for (let i = 0, n = Math.ceil(Math.log(this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay())); i < n; ++i) {
                    this.simulation.tick();
                }

                simulationNodes.forEach(simNode => {
                    simNode.origNode.x = simNode.x;
                    simNode.origNode.y = simNode.y;
                });
                /*simulationLinks.forEach(simLink => {
                    simLink.origLink.source = simLink.source.origNode;
                    simLink.origLink.target = simLink.target.origNode;
                });*/
            }.bind(this));

        },
        mounted() {
            this.panZoom = svgPanZoom(this.$refs.graphSvg,
                {
                    minZoom: 0.5
                    , maxZoom: 10
                    , fit: false
                    , contain: false
                    , center: true,
                    controlIconsEnabled: true
                });

        }
    }
</script>

<style scoped>
    svg.graph {
        height: inherit;
        width: 100%;
    }
</style>