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
                        <g v-if="selectedVertex && optionHighlightTrustingNodes">
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
                        <g v-if="selectedVertex && optionHighlightTrustedNodes">
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
    public selectedVertex!: ViewVertex;

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
    public onIsLoadingChanged(){
        this.centerCorrectVertex();
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

    transformAndZoom(){
        let transform = zoom.zoomIdentity.translate(this.width()/2, this.height()/2).scale(1);
        this.d3svg.call(this.graphZoom)
            .call(this.graphZoom.transform, transform);
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