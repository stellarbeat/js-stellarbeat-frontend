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
                    <g v-if="graphComputed && !isLoading">
                        <graph-strongly-connected-component
                            :greatest="true"
                            :vertex-coordinates="viewGraph.transitiveQuorumSetCoordinates"
                        />
                        <graph-strongly-connected-component :key="index"
                                                            v-for="(sccCoordinates, index) in viewGraph.stronglyConnectedComponentCoordinates"
                                                            :vertex-coordinates="sccCoordinates"/>
                        <GraphEdge
                            v-for="edge in viewGraph.regularEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
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
                        <GraphEdge
                            v-for="edge in viewGraph.stronglyConnectedEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
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
                            <GraphEdge
                                v-for="edge in viewGraph.trustingEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
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
                            <GraphEdge
                                v-for="edge in viewGraph.trustedEdges.filter(edge => !edge.isFailing || optionShowFailingEdges)"
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
                        <GraphVertex v-for="vertex in viewGraph.viewVertices.values()" :key="vertex.key"
                                     :publicKey="vertex.key"
                                     :selected="vertex.selected"
                                     :highlightAsOutgoing="vertex.highlightAsTrusted"
                                     :highlightAsIncoming="vertex.highlightAsTrusting"
                                     :partOfTransitiveQuorumSet="vertex.partOfTransitiveQuorumSet"
                                     :x="vertex.x"
                                     :y="vertex.y"
                                     :isFailing="vertex.isFailing"
                                     :label="vertex.label"
                        ></GraphVertex>
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Network, Node, PublicKey, Vertex} from '@stellarbeat/js-stellar-domain';

import GraphVertex from './graph-vertex.vue';
import {
    line,
    curveCatmullRomClosed
} from 'd3-shape';

import {polygonHull} from 'd3-polygon';

import ComputeGraphWorker from 'worker-loader?name=dist/[name].js!../../../workers/compute-graphv8.worker';
import {Component, Prop, Watch} from 'vue-property-decorator';
import GraphEdge from '@/components/visual-navigator/graph/graph-edge.vue';
import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';

import * as zoom from 'd3-zoom';
import {select, event as d3Event, Selection} from 'd3-selection';
import GraphStronglyConnectedComponent
    from '@/components/visual-navigator/graph/graph-strongly-connected-component.vue';
import {ViewEdge, ViewGraph, ViewVertex} from '@/components/visual-navigator/graph/graph-view';

const _ComputeGraphWorker: any = ComputeGraphWorker; // workaround for typescript not compiling web workers.

@Component({
    components: {
        GraphStronglyConnectedComponent,
        GraphLegend,
        GraphEdge,
        GraphVertex
    }
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

    @Prop({default: false})
    public fullScreen!: boolean;

    public d3svg!: any;
    public d3Grid!: any; //used for zooming and panning
    public graphZoom!: any;

    public name: string = 'graph';
    public isLoading: boolean = true;
    public computeGraphWorker = new _ComputeGraphWorker();
    public delayedCenter: boolean = false;
    public delayedVisualizeCenterNode: boolean = false;
    public networkId = this.store.networkId;
    public graphComputed = false;

    public viewGraph!: ViewGraph;

    @Watch('networkUpdated')
    public onNetworkUpdated() {
        if (this.networkId !== this.store.networkId) {
            this.viewGraph.reset();
            this.graphComputed = false;
        }
        this.updateGraph(true);
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
        //this.updateGraph();
    }

    @Watch('optionHighlightTrustingNodes')
    public onOptionHighlightTrustingNodesChanged() {
        //this.updateGraph();
    }

    @Watch('optionHighlightTrustedNodes')
    public onOptionHighlightTrustedNodesChanged() {
        //this.updateGraph();
    }

    @Watch('optionTransitiveQuorumSetOnly')
    public onOptionTransitiveQuorumSetOnlyChanged() {
        //this.updateGraph();
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
    public onFullScreenChanged() {
        let transform = zoom.zoomIdentity.translate((this.width - (1 * this.width)) / 2, (this.height - (1 * this.height)) / 2).scale(1);
        if (this.fullScreen) {
            this.d3svg.call(this.graphZoom.transform, transform);
        } else {
            if (this.centerNode) {
                this.centerCorrectNode();
            } else {
                this.d3svg.call(this.graphZoom.transform, transform);
            }
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

    protected visualizeSelectedNodes() {
        let selectedKey = undefined;
        if (this.selectedNode)
            selectedKey = this.selectedNode.publicKey;
        this.viewGraph.reClassifyEdges(selectedKey);
        this.viewGraph.reClassifyVertices(selectedKey);
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
            let centerVertexViewData = this.viewGraph.viewVertices.get(this.centerVertex()!.key);

            const realNodeX = -centerVertexViewData!.x * 1 + this.width / 2;
            const realNodeY = -centerVertexViewData!.y * 1 + this.height / 2;

            let transform = zoom.zoomIdentity.translate(realNodeX, realNodeY).scale(1);
            this.d3svg.call(this.graphZoom.transform, transform);
            this.delayedCenter = false;
        }
    }

    centerVertex(): Vertex | undefined {
        if (this.centerNode)
            return this.network.nodesTrustGraph.getVertex(this.centerNode.publicKey!);

        return undefined;
    }


    public updateGraph(mergeWithPreviousGraph: boolean = false) {
        this.isLoading = true;
        this.viewGraph = ViewGraph.fromNodes(this.network, mergeWithPreviousGraph ? this.viewGraph : undefined, this.selectedNode ? this.selectedNode.publicKey : undefined);

        this.computeGraphWorker.postMessage({
            vertices: Array.from(this.viewGraph.viewVertices.values()),
            edges: Array.from(this.viewGraph.viewEdges.values()),
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
            .call(this.graphZoom);
        // .call(this.graphZoom.transform, transform);

        if (this.centerNode)
            this.delayedCenter = true;

        this.computeGraphWorker.onmessage = (
            event: { data: { type: string, vertices: ViewVertex[], edges: ViewEdge[] } }
        ) => {
            switch (event.data.type) {
                case 'tick': {

                }
                    break;
                case 'end': {
                    event.data.vertices.forEach(
                        updatedVertex => {
                            let vertex = this.viewGraph.viewVertices.get(updatedVertex.key);
                            if (!vertex)
                                return;
                            vertex.x = updatedVertex.x;
                            vertex.y = updatedVertex.y;
                        }
                    );

                    event.data.edges.forEach(updatedEdge => {
                            let edge = this.viewGraph.viewEdges.get(updatedEdge.key);
                            if (!edge)
                                return;
                            edge.source = updatedEdge.source;
                            edge.target = updatedEdge.target;
                        }
                    );
                    this.graphComputed = true;
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
        //this.viewGraph = ViewGraph.fromNodes(this.network,  undefined, this.selectedNode ? this.selectedNode.publicKey : undefined);
        this.updateGraph(false);
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