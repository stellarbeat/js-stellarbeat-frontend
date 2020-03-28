<template xmlns="http://www.w3.org/1999/html">
    <div class="graph mr-1">
        <div class="col-xs-12" style="width: 100%">
            <div v-bind:class="dimmerClass">
                <div class="loader"></div>
                <div class="dimmer-content">
                    <svg class="graph" xmlns="http://www.w3.org/2000/svg"
                         ref="graphSvg"
                         width="100%"
                         height="450px"
                    >
                        <g class="svg-pan-zoom_viewport">

                            <g class="transitive-quorum-set">
                                <path
                                        class="transitive-path"
                                        v-bind:d="transitivePath"
                                        v-bind:transform="transitiveTransform"
                                />
                            </g>
                            <GraphEdge v-for="edge in edgesViewData"
                                       :highlightAsOutgoing="edge.highlightAsOutgoing"
                                       :highlightAsIncoming="edge.highlightAsIncoming"
                                       :isPartOfStronglyConnectedComponent="edge.isPartOfStronglyConnectedComponent"
                                       :parentX="edge.source.x"
                                       :parentY="edge.source.y"
                                       :childX="edge.target.x"
                                       :childY="edge.target.y"
                                       :isFailing="edge.isFailing"
                                       :hideRegular="!optionShowRegularEdges"
                            ></GraphEdge>
                            <GraphVertex v-for="vertex in verticesViewData.values()" :key="vertex.publicKey"
                                         :publicKey="vertex.publicKey"
                                         :selected="vertex.selected"
                                         :highlightAsOutgoing="vertex.highlightAsOutgoing"
                                         :highlightAsIncoming="vertex.highlightAsIncoming"
                                         :partOfTransitiveQuorumSet="vertex.partOfTransitiveQuorumSet"
                                         :x="vertex.x"
                                         :y="vertex.y"
                                         :isValidating="vertex.isValidating"
                                         :label="vertex.label"
                            ></GraphVertex>
                        </g>
                    </svg>
                </div>
            </div>
        </div>
        <div v-show="false">
            <label v-if="selectedNode" class="custom-switch mt-2 mr-2">

                <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                       v-model="optionHighlightTrustedNodes">
                <span class="custom-switch-indicator"></span>
                <span class="custom-switch-description">Highlight trusted nodes</span>

            </label>
            <label  v-if="selectedNode" class="custom-switch mt-2 mr-2">

                <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                       v-model="optionHighlightTrustingNodes">
                <span class="custom-switch-indicator"></span>
                <span class="custom-switch-description">Highlight trusting nodes</span>

            </label>
            <label class="custom-switch mt-2 mr-2">

                <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                       v-model="optionShowRegularEdges">
                <span class="custom-switch-indicator"></span>
                <span class="custom-switch-description">Show regular edges</span>

            </label>
            <label class="custom-switch mt-2 mr-2">

                <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                       v-model="optionShowFailingEdges">
                <span class="custom-switch-indicator"></span>
                <span class="custom-switch-description">Show failing edges</span>

            </label>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Network, Node, PublicKey, Vertex, QuorumSet} from "@stellarbeat/js-stellar-domain";
    import GraphVertex from "./graph-vertex.vue";
    import svgPanZoom from "svg-pan-zoom";
    import {line, curveLinearClosed} from "d3-shape";
    import {polygonHull, polygonCentroid} from "d3-polygon";

    import ComputeGraphWorker from "worker-loader?name=dist/[name].js!./../../../workers/compute-graphv6.worker";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import GraphEdge from "@/components/visual-navigator/graph/graph-edge.vue";

    type VertexViewData = {
        publicKey: PublicKey,
        label: string,
        x: number,
        y: number,
        isPartOfTransitiveQuorumSet: boolean,
        highlightAsOutgoing: boolean,
        highlightAsIncoming: boolean,
        selected: boolean,
        isValidating: boolean
    };

    type EdgeViewData = {
        source: any, //publicKey is replaced by object in d3
        target: any,//publicKey is replaced by object in d3
        isPartOfStronglyConnectedComponent: boolean,
        highlightAsOutgoing: boolean,
        highlightAsIncoming: boolean,
        isFailing: boolean
    }

    const _ComputeGraphWorker: any = ComputeGraphWorker; // workaround for typescript not compiling web workers.

    @Component({
        components: {
            GraphEdge,
            GraphVertex
        },
    })
    export default class Graph extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public centerNode!: Node;
        @Prop()
        public selectedNode!: Node;

        public name: string = "graph";
        public panZoom!: SvgPanZoom.Instance;
        public isLoading: boolean = true;
        public computeGraphWorker = new _ComputeGraphWorker();
        public delayedCenter: boolean = false;
        public delayedVisualizeCenterNode: boolean = false;
        public transitivePath: string = "";
        public transitiveCentroid: { 0: number, 1: number } = {0: 0, 1: 0};
        public verticesViewData: Map<PublicKey, VertexViewData> = new Map();
        public edgesViewData: EdgeViewData[] = [];
        public optionShowFailingEdges: boolean = false;
        public optionHighlightTrustingNodes: boolean = true;
        public optionHighlightTrustedNodes: boolean = true;
        public optionShowRegularEdges: boolean = true;

        @Watch("networkUpdated")
        public onNetworkUpdated() {
            this.restartSimulation();
        }

        @Watch("centerNode")
        public onCenterNodeChanged() {
            if (!this.isLoading) {
                this.centerCorrectNode();
            }

            if (this.isLoading) {
                this.delayedCenter = true;
            }
        }

        @Watch("optionShowFailingEdges")
        public onOptionShowFailingEdgesChanged() {
            this.computeGraph();
        }

        @Watch("optionHighlightTrustingNodes")
        public onOptionHighlightTrustingNodesChanged() {
            this.computeGraph();
        }

        @Watch("optionHighlightTrustedNodes")
        public onOptionHighlightTrustedNodesChanged() {
            this.computeGraph();
        }

        @Watch("selectedNode")
        public onSelectedNodeChanged() {
            if (!this.isLoading) {
                this.visualizeSelectedNodes();
            } else {
                this.delayedVisualizeCenterNode = true;
            }
        }

        @Watch("selectedOrganization")
        public onSelectedOrganizationChanged() {
            if (!this.isLoading) {
                this.visualizeSelectedNodes();
            } else {
                this.delayedVisualizeCenterNode = true;
            }
        }

        get store() {
            return this.$root.$data.store;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
        }

        get networkUpdated() {
            return this.store.networkUpdated;
        }

        protected sortEdges(a: EdgeViewData, b: EdgeViewData) {
            if (a.highlightAsOutgoing)
                return +5;
            if (b.highlightAsOutgoing)
                return -5;
            if (a.highlightAsIncoming)
                return +5;
            if (b.highlightAsIncoming)
                return -5;
            if (a.isFailing)
                return +5;
            if (b.isFailing)
                return -5;
            return 0;
        };

        protected visualizeSelectedNodes() {
            console.log("vis");
            this.verticesViewData.forEach(vertex => {
                let dataVertex = this.network.graph.getVertex(vertex.publicKey)!;
                vertex.selected = false;
                if(this.selectedNode)
                    vertex.selected = this.selectedNode.publicKey === vertex.publicKey;
                if(this.selectedOrganization) {
                    vertex.selected = this.selectedOrganization.validators.includes(vertex.publicKey);
                }
                vertex.highlightAsOutgoing = this.highlightVertexAsTrusting(dataVertex);
                vertex.highlightAsIncoming = this.highLightVertexAsTrusted(dataVertex);
            });

            this.edgesViewData.forEach(edge => {
                edge.highlightAsOutgoing =
                    this.selectedNode && this.optionHighlightTrustedNodes ? edge.source.publicKey === this.selectedNode.publicKey : false;
                edge.highlightAsIncoming =
                    this.selectedNode && this.optionHighlightTrustingNodes ? edge.target.publicKey === this.selectedNode.publicKey : false;
            });

            this.edgesViewData.sort(this.sortEdges);

            this.delayedVisualizeCenterNode = false;
        }

        get width() {
            return (this.$refs.graphSvg as SVGElement).clientWidth;
        }

        get height() {
            return (this.$refs.graphSvg as SVGElement).clientHeight;
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

        public centerCorrectNode() {
            if (this.centerVertex() !== undefined) {
                let centerVertexViewData = this.verticesViewData.get(this.centerVertex()!.publicKey);
                // noinspection TypeScriptUnresolvedFunction
                const height = this.panZoom.getSizes().height;
                // noinspection TypeScriptUnresolvedFunction
                const width = this.panZoom.getSizes().width;
                // noinspection TypeScriptUnresolvedFunction
                const sizes = this.panZoom.getSizes();
                // noinspection TypeScriptUnresolvedVariable
                const zoom = sizes.realZoom;
                const realNodeX = -centerVertexViewData!.x * zoom + width / 2;
                const realNodeY = -centerVertexViewData!.y * zoom + height / 2;
                // noinspection TypeScriptValidateTypes
                this.panZoom.pan({x: realNodeX, y: realNodeY});
                this.delayedCenter = false;
            }
        }

        public getTransitiveQuorumSetHull(simulationNodes: Array<VertexViewData>) {
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
                    .filter(vertex => vertex.isPartOfTransitiveQuorumSet)
                    .map(vertex => [vertex.x, vertex.y]));
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

        highlightVertexAsTrusting(vertex: Vertex) {
            if (!this.optionHighlightTrustingNodes)
                return false;
            if (!this.selectedNode)
                return false;
            let selectedVertex = this.network.graph.getVertex(this.selectedNode.publicKey!);
            if (selectedVertex === undefined) {
                return false;
            }
            return vertex.isValidating &&
                selectedVertex.isValidating
                && this.selectedNode.publicKey !== vertex.publicKey
                && this.network.graph.getChildren(vertex).has(selectedVertex)
                && (!this.network.graph.getChildren(selectedVertex).has(vertex) || !this.optionHighlightTrustedNodes);
        }

        highLightVertexAsTrusted(vertex: Vertex): boolean {
            if (!this.optionHighlightTrustedNodes)
                return false;
            if (!this.selectedNode)
                return false;
            let selectedVertex = this.network.graph.getVertex(this.selectedNode.publicKey!);
            if (selectedVertex === undefined) {
                return false;
            }
            return vertex.isValidating
                && selectedVertex.isValidating
                && this.selectedNode.publicKey !== vertex.publicKey
                && this.network.graph.getChildren(selectedVertex).has(vertex);
        }

        centerVertex(): Vertex | undefined {
            if (this.centerNode)
                return this.network.graph.getVertex(this.centerNode.publicKey!);

            return undefined;
        }


        public computeGraph() {
            this.isLoading = true;
            const simulationVertices: Array<VertexViewData> = Array.from(this.network.graph.vertices.values())
                .map((vertex) => {
                    return {
                        publicKey: vertex.publicKey,
                        label: vertex.label,
                        x: this.verticesViewData.get(vertex.publicKey) ?
                            this.verticesViewData.get(vertex.publicKey)!.x : 0,
                        y: this.verticesViewData.get(vertex.publicKey) ?
                            this.verticesViewData.get(vertex.publicKey)!.y : 0,
                        isPartOfTransitiveQuorumSet: this.network.graph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.publicKey),
                        selected: this.selectedNode ?
                            this.selectedNode.publicKey === vertex.publicKey :
                        this.selectedOrganization ? this.selectedOrganization.validators.includes(vertex.publicKey): false,
                        highlightAsIncoming:
                            this.highLightVertexAsTrusted(vertex),
                        highlightAsOutgoing:
                            this.highlightVertexAsTrusting(vertex),
                        isValidating: vertex.isValidating
                    };
                });

            const simulationEdges: Array<EdgeViewData> = Array.from(this.network.graph.edges.values())
                .filter((edge) => edge.isActive || this.optionShowFailingEdges)
                .map((edge) => {
                    return {
                        source: edge.parent.publicKey,
                        target: edge.child.publicKey,
                        isPartOfTransitiveQuorumSet: this.network.graph.isEdgePartOfNetworkTransitiveQuorumSet(edge),
                        isPartOfStronglyConnectedComponent: this.network.graph.isEdgePartOfStronglyConnectedComponent(edge),
                        highlightAsOutgoing:
                            this.selectedNode && this.optionHighlightTrustedNodes ? edge.parent.publicKey === this.selectedNode.publicKey : false,
                        highlightAsIncoming:
                            this.selectedNode && this.optionHighlightTrustingNodes ? edge.child.publicKey === this.selectedNode.publicKey : false,
                        isFailing: !edge.isActive
                    };
                });

            this.computeGraphWorker.postMessage({
                vertices: simulationVertices,
                edges: simulationEdges,
                width: this.width,
                height: this.height
            });
        }

        public mounted() {
            this.panZoom = svgPanZoom(this.$refs.graphSvg as SVGElement,
                {
                    mouseWheelZoomEnabled: false,
                    minZoom: 0.5
                    , maxZoom: 10
                    , fit: false
                    , contain: false
                    , center: false,
                    controlIconsEnabled: true,
                });
            this.panZoom.zoomBy(2);

            if (this.centerNode)
                this.delayedCenter = true;

            this.computeGraphWorker.onmessage = (
                event: { data: { type: string, vertices: VertexViewData[], edges: EdgeViewData[] } }
            ) => {
                switch (event.data.type) {
                    case "tick": {

                    }
                        break;
                    case "end": {
                        this.verticesViewData = new Map<PublicKey, VertexViewData>();
                        event.data.vertices.forEach(
                            vertex => this.verticesViewData.set(vertex.publicKey, vertex)
                        );

                        event.data.edges.sort(this.sortEdges);

                        this.edgesViewData = event.data.edges;

                        this.isLoading = false;

                        if (this.delayedCenter) {
                            this.centerCorrectNode();
                        }
                        if (this.delayedVisualizeCenterNode) {
                            this.visualizeSelectedNodes();
                        }
                        this.transitivePath = this.getTransitiveQuorumSetHull(event.data.vertices);
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
        cursor: grab;
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