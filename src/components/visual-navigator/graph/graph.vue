<template xmlns="http://www.w3.org/1999/html">
    <div v-bind:class="dimmerClass" style="height: 100%;">
        <div class="loader"></div>
        <div class="dimmer-content" style="height: 100%;">
            <svg class="graph" xmlns="http://www.w3.org/2000/svg"
                 ref="graphSvg"
                 width="100%"
                 height="100%"
            >
                <g ref="grid">
                    <g v-if="dataInitialized">
                    <graph-strongly-connected-component
                        :greatest="true"
                        :vertex-coordinates="transitiveQuorumSetCoordinates"
                    />
                    <graph-strongly-connected-component :key="index"
                        v-for="(sccCoordinates, index) in stronglyConnectedComponentCoordinates"
                        :vertex-coordinates="sccCoordinates"/>
                    <GraphEdge v-for="edge in regularEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
                               :key="edge.source.key + edge.target.key"
                               :highlightAsOutgoing="false"
                               :highlightAsIncoming="false"
                               :isPartOfStronglyConnectedComponent="false"
                               :parentX="edge.source.x"
                               :parentY="edge.source.y"
                               :childX="edge.target.x"
                               :childY="edge.target.y"
                               :isFailing="edge.isFailing"
                               :hideRegular="!optionShowRegularEdges"
                    />
                    <GraphEdge v-for="edge in stronglyConnectedEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
                               :key="edge.source.key + edge.target.key"
                               :highlightAsOutgoing="false"
                               :highlightAsIncoming="false"
                               :isPartOfStronglyConnectedComponent="true"
                               :parentX="edge.source.x"
                               :parentY="edge.source.y"
                               :childX="edge.target.x"
                               :childY="edge.target.y"
                               :isFailing="edge.isFailing"
                               :hideRegular="!optionShowRegularEdges"
                    />
                    <g v-if="selectedNode && optionHighlightTrustingNodes">
                        <GraphEdge v-for="edge in trustingEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
                                   :key="edge.source.key + edge.target.key"
                                   :highlightAsOutgoing="false"
                                   :highlightAsIncoming="true"
                                   :isPartOfStronglyConnectedComponent="false"
                                   :parentX="edge.source.x"
                                   :parentY="edge.source.y"
                                   :childX="edge.target.x"
                                   :childY="edge.target.y"
                                   :isFailing="edge.isFailing"
                                   :hideRegular="!optionShowRegularEdges"
                        />
                    </g>
                    <g v-if="selectedNode && optionHighlightTrustedNodes">
                        <GraphEdge v-for="edge in trustedEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
                                   :key="edge.source.key + edge.target.key"
                                   :highlightAsOutgoing="true"
                                   :highlightAsIncoming="false"
                                   :isPartOfStronglyConnectedComponent="false"
                                   :parentX="edge.source.x"
                                   :parentY="edge.source.y"
                                   :childX="edge.target.x"
                                   :childY="edge.target.y"
                                   :isFailing="edge.isFailing"
                                   :hideRegular="!optionShowRegularEdges"
                        />
                    </g>
                    <GraphVertex v-for="vertex in verticesViewData.values()" :key="vertex.key"
                                 :publicKey="vertex.key"
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
                </g></svg>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Network, Node, PublicKey, Vertex, QuorumSet} from '@stellarbeat/js-stellar-domain';

    import GraphVertex from './graph-vertex.vue';
    import {
      line,
      curveCatmullRomClosed, curveBasis, curveCatmullRom, curveCatmullRomOpen
    } from 'd3-shape';

    import {polygonHull, polygonCentroid} from 'd3-polygon';

    import ComputeGraphWorker from 'worker-loader?name=dist/[name].js!../../../workers/compute-graphv8.worker';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import GraphEdge from '@/components/visual-navigator/graph/graph-edge.vue';
    import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';

    import * as zoom from 'd3-zoom';
    import {select, event as d3Event, Selection} from 'd3-selection';
    import {VBTooltip} from 'bootstrap-vue';
    import GraphStronglyConnectedComponent
      from '@/components/visual-navigator/graph/graph-strongly-connected-component.vue';

    type VertexViewData = {
        key: PublicKey,
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
          GraphStronglyConnectedComponent,
            GraphLegend,
            GraphEdge,
            GraphVertex
        },
        directives: {'b-tooltip': VBTooltip}
    })
    export default class Graph extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public centerNode!: Node;
        @Prop()
        public selectedNode!: Node;

        @Prop({default: false})
        public optionShowFailingEdges!: boolean;

        @Prop({default: true})
        public optionHighlightTrustingNodes!: boolean;

        @Prop({default: true})
        public optionHighlightTrustedNodes!: boolean;

        @Prop({default: true})
        public optionShowRegularEdges!: boolean;

        @Prop({default: true})
        public optionTransitiveQuorumSetOnly!: boolean;

        @Prop({default:false})
        public fullScreen!:boolean;

        public d3svg!: any;
        public d3Grid!: any; //used for zooming and panning
        public graphZoom!:any;

        public name: string = 'graph';
        public isLoading: boolean = true;
        public computeGraphWorker = new _ComputeGraphWorker();
        public delayedCenter: boolean = false;
        public delayedVisualizeCenterNode: boolean = false;
        public networkId = this.store.networkId;
        public dataInitialized = false;

        //computed data
        public verticesViewData: Map<PublicKey, VertexViewData> = new Map();
        public edgesViewData: EdgeViewData[] = [];
        public stronglyConnectedComponents: [VertexViewData][] = [];


        @Watch('networkUpdated')
        public onNetworkUpdated() {
            if(this.networkId !== this.store.networkId){
                this.verticesViewData = new Map();
                this.stronglyConnectedComponents = [];
                this.edgesViewData = [];
                this.dataInitialized = false;
            }
            this.computeGraph();
        }

        @Watch('centerNode')
        public onCenterNodeChanged() {
            if (!this.isLoading) {
                this.centerCorrectNode();
            }

            if (this.isLoading) {
                this.delayedCenter = true;
            }
        }

        @Watch('optionShowFailingEdges')
        public onOptionShowFailingEdgesChanged() {
            this.computeGraph();
        }

        @Watch('optionHighlightTrustingNodes')
        public onOptionHighlightTrustingNodesChanged() {
            this.computeGraph();
        }

        @Watch('optionHighlightTrustedNodes')
        public onOptionHighlightTrustedNodesChanged() {
            this.computeGraph();
        }

        @Watch('optionTransitiveQuorumSetOnly')
        public onOptionTransitiveQuorumSetOnlyChanged() {
            this.computeGraph();
        }

        @Watch('selectedNode')
        public onSelectedNodeChanged() {
            if (!this.isLoading) {
                this.visualizeSelectedNodes();
            } else {
                this.delayedVisualizeCenterNode = true;
            }
        }

        @Watch('selectedOrganization')
        public onSelectedOrganizationChanged() {
            if (!this.isLoading) {
                this.visualizeSelectedNodes();
            } else {
                this.delayedVisualizeCenterNode = true;
            }
        }

        @Watch('fullScreen')
        public onFullScreenChanged(){
            let transform = zoom.zoomIdentity.translate((this.width-(1*this.width))/2, (this.height-(1*this.height))/2).scale(1);
            if(this.fullScreen){
                this.d3svg.call(this.graphZoom.transform, transform);
            } else {
                if(this.centerNode){
                    this.centerCorrectNode();
                } else {
                    this.d3svg.call(this.graphZoom.transform, transform);
                }
            }

        }

        get regularEdges() {
            return this.edgesViewData.filter(edge => {
                if(this.selectedNode &&
                    (this.optionHighlightTrustedNodes || this.optionHighlightTrustingNodes) &&
                    (edge.source.key === this.selectedNode.publicKey || edge.target.key === this.selectedNode.publicKey)){
                    return false;
                }

                if(edge.isPartOfStronglyConnectedComponent)
                    return false;

                return true;
            })
        }

        get stronglyConnectedEdges() {
            return this.edgesViewData.filter(edge => {
                if(this.selectedNode &&
                    (this.optionHighlightTrustedNodes || this.optionHighlightTrustingNodes) &&
                    (edge.source.key === this.selectedNode.publicKey || edge.target.key === this.selectedNode.publicKey)){
                    return false;
                }

                return edge.isPartOfStronglyConnectedComponent;
            })
        }

        get trustingEdges() {
            return this.edgesViewData.filter(edge => {
                return edge.target.key === this.selectedNode.publicKey;
            })
        }

        get trustedEdges() {
            return this.edgesViewData.filter(edge => {
                return edge.source.key === this.selectedNode.publicKey;
            })
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

        protected visualizeSelectedNodes() {
            this.verticesViewData.forEach(vertex => {
                let dataVertex = this.network.nodesTrustGraph.getVertex(vertex.key)!;
                vertex.selected = false;
                if (this.selectedNode)
                    vertex.selected = this.selectedNode.publicKey === vertex.key;
                if (this.selectedOrganization) {
                    vertex.selected = this.selectedOrganization.validators.includes(vertex.key);
                }
                vertex.highlightAsOutgoing = this.highlightVertexAsTrusting(dataVertex);
                vertex.highlightAsIncoming = this.highLightVertexAsTrusted(dataVertex);
            });

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

        public centerCorrectNode() {
            if (this.centerVertex() !== undefined) {
                let centerVertexViewData = this.verticesViewData.get(this.centerVertex()!.key);

                const realNodeX = -centerVertexViewData!.x * 1 + this.width / 2;
                const realNodeY = -centerVertexViewData!.y * 1 + this.height / 2;

                let transform = zoom.zoomIdentity.translate(realNodeX, realNodeY).scale(1);
                this.d3svg.call(this.graphZoom.transform, transform);
                this.delayedCenter = false;
            }
        }

        get transitiveQuorumSetCoordinates() {
          console.log('calculate');
            let transitiveQuorumSetPoints: [number, number][] = Array.from(this.verticesViewData.values())
              .filter(vertex => vertex.isPartOfTransitiveQuorumSet)
              .map(vertex => [vertex.x, vertex.y]);

            return transitiveQuorumSetPoints;
        }

      get stronglyConnectedComponentCoordinates(){
            let sccPointsArray:[number, number][][] = this.stronglyConnectedComponents.map(scc => {
                return scc.map(vertex => [vertex.x, vertex.y])
            })

            //add dummy point because hull needs minimum 3 points
            sccPointsArray.filter(sccPoints => sccPoints.length === 2 ).forEach(sccPoints => sccPoints.push([sccPoints[0][0], sccPoints[0][1] + 0.0001]))

            return sccPointsArray;
        }

        getHullLine(points: [number, number][]) {
          let hull = polygonHull(points);
          if (!hull)
            return null;

          let valueLine = line()
              .x(function (d) {
                return d[0];
              })
              .y(function (d) {
                return d[1];
              })
              .curve(curveCatmullRomClosed); //we want a smooth line

          let hullLine = valueLine(hull);

          if (hullLine) {
            return hullLine;
          }

          return null;
        }

        highlightVertexAsTrusting(vertex: Vertex) {
            if (!this.optionHighlightTrustingNodes)
                return false;
            if (!this.selectedNode)
                return false;
            let selectedVertex = this.network.nodesTrustGraph.getVertex(this.selectedNode.publicKey!);
            if (selectedVertex === undefined) {
                return false;
            }
            return vertex.available &&
                selectedVertex.available
                && this.selectedNode.publicKey !== vertex.key
                && this.network.nodesTrustGraph.getChildren(vertex).has(selectedVertex)
                && (!this.network.nodesTrustGraph.getChildren(selectedVertex).has(vertex) || !this.optionHighlightTrustedNodes);
        }

        highLightVertexAsTrusted(vertex: Vertex): boolean {
            if (!this.optionHighlightTrustedNodes)
                return false;
            if (!this.selectedNode)
                return false;
            let selectedVertex = this.network.nodesTrustGraph.getVertex(this.selectedNode.publicKey!);
            if (selectedVertex === undefined) {
                return false;
            }
            return vertex.available
                && selectedVertex.available
                && this.selectedNode.publicKey !== vertex.key
                && this.network.nodesTrustGraph.getChildren(selectedVertex).has(vertex);
        }

        centerVertex(): Vertex | undefined {
            if (this.centerNode)
                return this.network.nodesTrustGraph.getVertex(this.centerNode.publicKey!);

            return undefined;
        }


      public computeGraph() {
        this.isLoading = true;
        const simulationVertices: Array<VertexViewData> = [];
        let newVerticesViewData = new Map();
        this.stronglyConnectedComponents = []; //group in initialize
          Array.from(this.network.nodesTrustGraph.vertices.values())
              .filter((vertex) => !this.optionTransitiveQuorumSetOnly || this.network.nodesTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key))
              .forEach((vertex) => {
                let vertexViewData = {
                  key: vertex.key,
                  label: vertex.label,
                  x: this.verticesViewData.get(vertex.key) ?
                      this.verticesViewData.get(vertex.key)!.x : 0,
                  y: this.verticesViewData.get(vertex.key) ?
                      this.verticesViewData.get(vertex.key)!.y : 0,
                  isPartOfTransitiveQuorumSet: this.network.nodesTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(vertex.key),
                  selected: this.selectedNode ?
                      this.selectedNode.publicKey === vertex.key :
                      this.selectedOrganization ? this.selectedOrganization.validators.includes(vertex.key) : false,
                  highlightAsIncoming:
                      this.highLightVertexAsTrusted(vertex),
                  highlightAsOutgoing:
                      this.highlightVertexAsTrusting(vertex),
                  isValidating: vertex.available
                };
                simulationVertices.push(vertexViewData);
                newVerticesViewData.set(vertexViewData.key, vertexViewData);

                let sccIndex = this.network.nodesTrustGraph.getStronglyConnectedComponent(vertexViewData.key);
                if (sccIndex) {
                  if (!this.stronglyConnectedComponents[sccIndex])
                    this.stronglyConnectedComponents[sccIndex] = [vertexViewData];
                  else
                    this.stronglyConnectedComponents[sccIndex].push(vertexViewData);
                }
              });

          this.stronglyConnectedComponents = this.stronglyConnectedComponents.filter(scc => scc.length > 1);

            const simulationEdges: Array<EdgeViewData> = Array.from(this.network.nodesTrustGraph.edges.values())
                .filter(edge => this.network.nodesTrustGraph.isEdgePartOfNetworkTransitiveQuorumSet(edge) || !this.optionTransitiveQuorumSetOnly)
                .filter((edge) =>
                    edge.isActive
                    || this.network.nodesTrustGraph.isEdgePartOfStronglyConnectedComponent(edge) //we keep the failing nodes aligned in scp's
                    || this.optionShowFailingEdges)
                .map((edge) => {
                    return {
                        source: edge.parent.key,
                        target: edge.child.key,
                        isPartOfTransitiveQuorumSet: this.network.nodesTrustGraph.isEdgePartOfNetworkTransitiveQuorumSet(edge),
                        isPartOfStronglyConnectedComponent: this.network.nodesTrustGraph.isEdgePartOfStronglyConnectedComponent(edge),
                        highlightAsOutgoing:
                            this.selectedNode && this.optionHighlightTrustedNodes ? edge.parent.key === this.selectedNode.publicKey : false,
                        highlightAsIncoming:
                            this.selectedNode && this.optionHighlightTrustingNodes ? edge.child.key === this.selectedNode.publicKey : false,
                        isFailing: !edge.isActive
                    };
                });

          this.verticesViewData = newVerticesViewData;

            this.computeGraphWorker.postMessage({
                vertices: simulationVertices,
                edges: simulationEdges,
                width: this.width,
                height: this.height
            });
        }

        public mounted() {
            //let transform = zoom.zoomIdentity.translate((this.width-(1*this.width))/2, (this.height-(1*this.height))/2).scale(1);
            this.d3Grid = select(this.$refs.grid as Element);
            this.graphZoom = zoom.zoom().on('zoom', () => {
                this.d3Grid.attr('transform', d3Event.transform);
            }).scaleExtent([1, 3]);
           this.d3svg = select(this.$refs.graphSvg as Element)
                .call(this.graphZoom)
               // .call(this.graphZoom.transform, transform);

            if (this.centerNode)
                this.delayedCenter = true;

            this.computeGraphWorker.onmessage = (
                event: { data: { type: string, vertices: VertexViewData[], edges: EdgeViewData[] } }
            ) => {
                switch (event.data.type) {
                    case 'tick': {

                    }
                        break;
                    case 'end': {
                        event.data.vertices.forEach(
                            updatedVertex => {
                                let vertex = this.verticesViewData.get(updatedVertex.key);
                                if(!vertex)
                                  return;
                                vertex.x = updatedVertex.x;
                                vertex.y = updatedVertex.y;
                            }
                        );

                        this.edgesViewData = event.data.edges;
                        this.dataInitialized = true;
                        this.isLoading = false;

                        if (this.delayedCenter) {
                            this.centerCorrectNode();
                        }
                        if (this.delayedVisualizeCenterNode) {
                            this.visualizeSelectedNodes();
                        }
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

    .dimmer.active .dimmer-content {
        opacity: 0.4;
    }
</style>