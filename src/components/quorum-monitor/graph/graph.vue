<template xmlns="http://www.w3.org/1999/html">
    <div class="graph row mr-1">

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
                            <g class="transitive-quorum-set">
                                <path
                                        class="transitive-path"
                                        v-bind:d="transitivePath"
                                        v-bind:transform="transitiveTransform"
                                />
                            </g>
                            <GraphLink v-if="graphInitialized" v-for="link in linksFiltered" :link="link"
                                       :selectedNode="selectedNode" :key="link.id"></GraphLink>
                            <GraphLink v-if="graphInitialized" v-for="link in incomingLinks" :link="link"
                                       :selectedNode="selectedNode" :key="link.id"></GraphLink>
                            <GraphLink v-if="graphInitialized" v-for="link in outgoingLinks" :link="link"
                                       :selectedNode="selectedNode" :key="link.id"></GraphLink>
                            <GraphNode v-if="graphInitialized" v-for="node in nodesToVisualize" :key="node.publicKey"
                                       :node="node"
                                       :selectedNode="selectedNode"
                                       :network="network" :targetNodes="targetNodes" :sourceNodes="sourceNodes"
                                       :partOfTransitiveQuorumSet="nodeInTransitiveQuorumSet(node)"
                            ></GraphNode>
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Network, Node, PublicKey} from "@stellarbeat/js-stellar-domain";
    import GraphNode from "./graph-node.vue";
    import GraphLink from "./graph-link.vue";
    import svgPanZoom from "svg-pan-zoom";
    import {line, curveLinearClosed} from "d3-shape";
    import {polygonHull, polygonCentroid} from "d3-polygon";

    import ComputeGraphWorker from "worker-loader?name=dist/[name].js!./../../../workers/compute-graphv5.worker";
    import {Component, Prop, Watch} from "vue-property-decorator";

    type SimulationNode = {
        publicKey: PublicKey,
        x: number,
        y: number,
        isPartOfTransitiveQuorumSet: boolean,
        index: number
    };

    type SimulationLink = {
        source: PublicKey,
        target: PublicKey,
        isPartOfStronglyConnectedComponent: boolean,
        isPartOfTransitiveQuorumSet: boolean,
        index: number
    }


    const _ComputeGraphWorker: any = ComputeGraphWorker; // workaround for typescript not compiling web workers.

    @Component({
        components: {
            GraphNode,
            GraphLink,
        },
    })
    export default class Graph extends Vue {
        public name: string = "graph";
        public panZoom!: SvgPanZoom.Instance;
        public isLoading: boolean = true;
        public graphInitialized: boolean = false;
        public loadingProgress: number = 0;
        public computeGraphWorker = new _ComputeGraphWorker();
        public delayedCenter: boolean = false;
        public transitivePath: string = "";
        public transitiveCentroid: { 0: number, 1: number } = {0: 0, 1: 0};

        @Prop()
        public network!: Network;
        @Prop()
        public centerNode!: Node;
        @Prop()
        public selectedNode!: Node;

        @Watch("centerNode")
        public onCenterNodeChanged() {
            if (this.graphInitialized && !this.isLoading) {
                this.centerCorrectNode();
            }

            if (this.graphInitialized && this.isLoading) {
                this.delayedCenter = true;
            }
        }

        get nodesToVisualize() {
            return this.network.nodes.filter(node => {
                return this.network.getTrustingNodes(node).length !== 0 || node.quorumSet.hasValidators() || node.isValidating;
            });
        }

        get linksFiltered() {
            if (!this.selectedNode) {
                return this.network.links;
            }
            return this.network.links.filter(link => link.source !== this.selectedNode && link.target !== this.selectedNode);
        }

        get incomingLinks() {
            if (!this.selectedNode) {
                return [];
            }
            return this.network.links.filter(link => link.source !== link.target && link.target === this.selectedNode);
        }

        get outgoingLinks() {
            if (!this.selectedNode) {
                return [];
            }
            return this.network.links.filter(link => link.source !== link.target && link.source === this.selectedNode);
        }

        get progressBarWidth() {
            return "width: " + this.loadingProgress + "%";
        }

        get sourceNodes() {
            return new Set(this.network.links
                .filter((link) => link.target === this.selectedNode)
                .map((link) => link.source));
        }

        get targetNodes() {
            return new Set(this.network.links
                .filter((link) => link.source === this.selectedNode)
                .map((link) => link.target));
        }

        get dimmerClass() {
            return {
                dimmer: true,
                active: this.isLoading,
            };
        }

        get transitiveTransform() {
            return "translate(" + this.transitiveCentroid[0] + "," + (this.transitiveCentroid[1]) + ") scale(1)";
        }

        public restartSimulation() {
            this.computeGraph();
        }

        nodeInTransitiveQuorumSet(node: Node) {
            return this.network.getTransitiveQuorumSet() ? this.network.getTransitiveQuorumSet().nodes.has(node.publicKey) : false;
        }

        public centerCorrectNode() {
            if (this.centerNode) {
                // noinspection TypeScriptUnresolvedFunction
                const height = this.panZoom.getSizes().height;
                // noinspection TypeScriptUnresolvedFunction
                const width = this.panZoom.getSizes().width;
                // noinspection TypeScriptUnresolvedFunction
                const sizes = this.panZoom.getSizes();
                // noinspection TypeScriptUnresolvedVariable
                const zoom = sizes.realZoom;
                const realNodeX = -(this.centerNode as any).x * zoom + width / 2;
                const realNodeY = -(this.centerNode as any).y * zoom + height / 2;
                // noinspection TypeScriptValidateTypes
                this.panZoom.pan({x: realNodeX, y: realNodeY});
            }
        }


        public getTransitiveQuorumSetHull(simulationNodes: Array<SimulationNode>) {
            let valueLine = line()
                .x(function (d) {
                    return d[0];
                })
                .y(function (d) {
                    return d[1];
                })
                .curve(curveLinearClosed);
            let transitiveQSetHull = polygonHull(
                simulationNodes
                    .filter(node => node.isPartOfTransitiveQuorumSet)
                    .map(node => [node.x, node.y]));
            if (!transitiveQSetHull)
                return "";
            this.transitiveCentroid = polygonCentroid(transitiveQSetHull);
            let hull = valueLine(
                transitiveQSetHull.map(point => {
                    return [point[0] - this.transitiveCentroid[0], point[1] - this.transitiveCentroid[1]];
                })
            );

            if (hull) {
                return hull;
            }

            return "";
        }

        public computeGraph() {
            this.isLoading = true;
            // separate sim nodes to avoid slow rendering
            const simulationNodes: Array<SimulationNode> = this.nodesToVisualize
                .map((node, index) => {
                    return {
                        publicKey: node.publicKey,
                        x: (node as any).x,
                        y: (node as any).y,
                        isPartOfTransitiveQuorumSet: this.network.getTransitiveQuorumSet() ? this.network.getTransitiveQuorumSet().nodes.has(node.publicKey) : false,
                        index: index
                    };
                });

            const simulationLinks: Array<SimulationLink> = this.network.links.map((link, index) => {
                return {
                    source: link.source.publicKey,
                    target: link.target.publicKey,
                    isPartOfStronglyConnectedComponent: link.isPartOfStronglyConnectedComponent,
                    isPartOfTransitiveQuorumSet: link.isPartOfTransitiveQuorumSet,
                    index: index
                };
            });

            this.computeGraphWorker.postMessage({
                nodes: simulationNodes,
                links: simulationLinks
            });

        }

        public created() {
            this.nodesToVisualize.forEach((node) => {
                this.$set(node, "x", 0);
                this.$set(node, "y", 0);
            }); // trigger reactive changes on newly added x and y coordinates

            this.computeGraphWorker.onmessage = (event: any) => {
                switch (event.data.type) {
                    case "tick": {
                        // if(newLoadingProgress % 25 === 0)
                        //this.loadingProgress = Math.round(event.data.progress * 100);
                    }
                        break;
                    case "end": {
                        event.data.nodes.forEach(
                            (node: { index: number, x: number, y: number, publicKey: string }) => {
                                (this.nodesToVisualize[node.index] as any).x = node.x;
                                (this.nodesToVisualize[node.index] as any).y = node.y;
                            },
                        );
                        this.isLoading = false;
                        if (!this.graphInitialized) {
                            this.panZoom = svgPanZoom(this.$refs.graphSvg as SVGElement,
                                {
                                    mouseWheelZoomEnabled: false,
                                    minZoom: 0.5
                                    , maxZoom: 10
                                    , fit: false
                                    , contain: false
                                    , center: true,
                                    controlIconsEnabled: true,
                                });
                            this.graphInitialized = true;
                            // noinspection TypeScriptUnresolvedFunction
                            this.panZoom.zoomBy(2);
                            this.centerCorrectNode();
                        }
                        if (this.delayedCenter) {
                            this.centerCorrectNode();
                        }
                        this.transitivePath = this.getTransitiveQuorumSetHull(event.data.nodes);
                    }
                        break;
                }
            };
            this.computeGraph();
        }

        public beforeDestroy() {
            this.computeGraphWorker.terminate();
        }
    }
</script>

<style scoped>
    svg.graph {
        height: inherit;
        width: 100%;
        cursor: move;
    }

    .transitive-path {
        fill-opacity: .15;
        stroke-opacity: 0;
        fill: #1997c6;
        stroke: #1997c6;
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