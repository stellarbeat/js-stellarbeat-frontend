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

                    <g v-if="!isLoading">
                        <graph-strongly-connected-component
                            :greatest="true"
                            :vertex-coordinates="viewGraph.transitiveQuorumSetCoordinates"
                        />
                        <graph-strongly-connected-component v-if="!optionTransitiveQuorumSetOnly" :key="index"
                                                            v-for="(sccCoordinates, index) in viewGraph.stronglyConnectedComponentCoordinates"
                                                            :vertex-coordinates="sccCoordinates"/>
                        <path class="edge"
                            v-for="edge in viewGraph.regularEdges"
                            v-bind:class="getEdgeClassObject(edge)"
                            v-bind:d="getEdgePath(edge)"
                        />
                        <path class="edge"
                            v-for="edge in viewGraph.regularEdges.filter(edge => (!edge.isFailing || optionShowFailingEdges) && (edge.isPartOfTransitiveQuorumSet || !optionTransitiveQuorumSetOnly))"
                            :key="edge.source.key + edge.target.key"
                            v-bind:class="getEdgeClassObject(edge)"
                            v-bind:d="getEdgePath(edge)"
                        />
                        <path class="edge"
                            v-for="edge in viewGraph.stronglyConnectedEdges.filter(edge => (!edge.isFailing || optionShowFailingEdges) && (edge.isPartOfTransitiveQuorumSet || !optionTransitiveQuorumSetOnly))"
                            :key="edge.source.key + edge.target.key"
                            v-bind:class="getEdgeClassObject(edge)"
                            v-bind:d="getEdgePath(edge)"
                        />
                        <g v-if="selectedVertices.length > 0 && optionHighlightTrustingNodes">
                            <path class="edge"
                                v-for="edge in viewGraph.trustingEdges.filter(edge => (!edge.isFailing || optionShowFailingEdges) && (edge.isPartOfTransitiveQuorumSet || !optionTransitiveQuorumSetOnly))"
                                :key="edge.source.key + edge.target.key"
                                v-bind:class="getEdgeClassObject(edge)"
                                v-bind:d="getEdgePath(edge)"
                            />
                        </g>
                        <g v-if="selectedVertices.length > 0 && optionHighlightTrustedNodes">
                            <path class="edge"
                                v-for="edge in viewGraph.trustedEdges.filter(edge => (!edge.isFailing || optionShowFailingEdges)  && (edge.isPartOfTransitiveQuorumSet || !optionTransitiveQuorumSetOnly))"
                                :key="edge.source.key + edge.target.key"
                                v-bind:class="getEdgeClassObject(edge)"
                                v-bind:d="getEdgePath(edge)"
                            />
                        </g>
                        <GraphVertex
                            v-for="vertex in Array.from(viewGraph.viewVertices.values()).filter(vertex => vertex.isPartOfTransitiveQuorumSet || !optionTransitiveQuorumSetOnly)"
                            :key="vertex.key"
                            :publicKey="vertex.key"
                            :selected="vertex.selected"
                            :highlightAsOutgoing="highlightVertexAsOutgoing(vertex)"
                            :highlightAsIncoming="highlightVertexAsIncoming(vertex)"
                            :partOfTransitiveQuorumSet="vertex.partOfTransitiveQuorumSet"
                            :x="vertex.x"
                            :y="vertex.y"
                            :isFailing="vertex.isFailing"
                            :label="vertex.label"
                            v-on:click.native="vertexSelected(vertex)"
                        ></GraphVertex>
                    </g>
                </g>
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import GraphVertex from './graph-vertex.vue';
import {Component, Mixins, Prop, Watch} from 'vue-property-decorator';
import GraphEdge from '@/components/visual-navigator/graph/graph-edge.vue';
import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';

import * as zoom from 'd3-zoom';
import {select} from 'd3-selection';
import GraphStronglyConnectedComponent
    from '@/components/visual-navigator/graph/graph-strongly-connected-component.vue';
import {StoreMixin} from '@/mixins/StoreMixin';
import ViewVertex from '@/components/visual-navigator/graph/view-vertex';
import ViewGraph from '@/components/visual-navigator/graph/view-graph';
import ViewEdge from '@/components/visual-navigator/graph/view-edge';

@Component({
    components: {
        GraphStronglyConnectedComponent,
        GraphLegend,
        GraphEdge,
        GraphVertex
    }
})
export default class Graph extends Mixins(StoreMixin) {
    @Prop()
    public centerVertex!: ViewVertex;
    @Prop()
    public selectedVertices!: ViewVertex[];

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

    @Prop({default: true})
    public isLoading!: boolean;

    @Prop()
    public viewGraph!: ViewGraph;

    public d3svg!: any;
    public d3Grid!: any; //used for zooming and panning
    public graphZoom!: any;

    @Watch('centerVertex')
    public onCenterNodeChanged() {
        this.centerCorrectVertex();
    }

    @Watch('fullScreen')
    public onFullScreenChanged() {
        this.centerCorrectVertex();
        this.transformAndZoom();
    }

    @Watch('isLoading')
    public onIsLoadingChanged() {
        this.centerCorrectVertex();
    }

    vertexSelected(vertex: ViewVertex) {
        this.$emit('vertex-selected', vertex);
    }

    highlightVertexAsOutgoing(vertex: ViewVertex) {
        if (this.selectedVertices.length <= 0)
            return false;
        let edges = this.selectedVertices.map(selectedVertex => this.viewGraph.viewEdges.get(vertex.key + ':' + selectedVertex.key)).filter(edge => edge !== undefined);
        let allEdgesAreFailing = edges.every(edge => edge!.isFailing);

        if (edges.length <= 0)
            return false;

        return vertex.isTrustingSelectedVertex && this.optionHighlightTrustingNodes && (!allEdgesAreFailing || this.optionShowFailingEdges);
    }

    highlightVertexAsIncoming(vertex: ViewVertex) {
        if (this.selectedVertices.length <= 0)
            return false;

        let edges = this.selectedVertices.map(selectedVertex => this.viewGraph.viewEdges.get(selectedVertex.key + ':' + vertex.key)).filter(edge => edge !== undefined);
        let allEdgesAreFailing = edges.every(edge => edge!.isFailing);

        if (edges.length <= 0)
            return false;

        return vertex.isTrustedBySelectedVertex && this.optionHighlightTrustedNodes && (!allEdgesAreFailing || this.optionShowFailingEdges);
    }

    width() {
        return (this.$refs.graphSvg as SVGElement).clientWidth;
    }

    height() {
        return (this.$refs.graphSvg as SVGElement).clientHeight;
    }

    get dimmerClass() {
        return {
            dimmer: true,
            active: this.isLoading,
        };
    }

    public centerCorrectVertex() {
        if (this.centerVertex !== undefined) {
            const realVertexX = -this.centerVertex!.x + this.width() / 2;
            const realVertexY = -this.centerVertex!.y + this.height() / 2;

            let transform = zoom.zoomIdentity.translate(realVertexX, realVertexY).scale(1);
            this.d3svg.call(this.graphZoom.transform, transform);
        }
    }

    public mounted() {
        this.d3Grid = select(this.$refs.grid as Element);
        this.d3svg = select(this.$refs.graphSvg as Element);
        this.graphZoom = zoom.zoom().on('zoom', (event) => {
            this.d3Grid.attr('transform', event.transform);
        }).scaleExtent([1, 3]);
        this.transformAndZoom();
    }

    transformAndZoom() {
        let transform = zoom.zoomIdentity.translate(this.width() / 2, this.height() / 2).scale(1);
        this.d3svg.call(this.graphZoom)
            .call(this.graphZoom.transform, transform);
    }

    getEdgeClassObject(edge: ViewEdge) {
        return {
            'outgoing': edge.highlightAsTrusted,
            'incoming': edge.highlightAsTrusting,
            'strongly-connected': edge.isPartOfStronglyConnectedComponent,
            'failing': edge.isFailing,
        };
    }

    getEdgePath(edge: ViewEdge) {
        return 'M' +
            edge.source.x + ' ' +
            edge.source.y + ' L' +
            edge.target.x + ' ' +
            edge.target.y;
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

path.edge {
    stroke: #1997c6;
    stroke-width: 0.5px;
    stroke-opacity: 0.07;
    fill-opacity: 0;
}

path.strongly-connected {
    stroke: #1997c6;
    stroke-width: 0.7px;
    stroke-opacity: 0.25;
}

path.failing {
    stroke: #cd201f;
}

path.outgoing {
    stroke: #fec601;
    stroke-opacity: 1;
    stroke-width: 2px;
}

path.incoming {
    stroke: #73bfb8;
    stroke-opacity: 1;
    stroke-width: 2px;
}
</style>