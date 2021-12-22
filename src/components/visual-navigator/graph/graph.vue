<template>
  <div v-bind:class="dimmerClass" style="height: 100%">
    <div class="loader"></div>
    <div class="dimmer-content svg-wrapper h-100">
      <svg
        class="graph"
        xmlns="http://www.w3.org/2000/svg"
        ref="graphSvg"
        width="100%"
        height="100%"
      >
        <g ref="grid">
          <g v-if="!isLoading">
            <path
              class="edge"
              v-for="edge in viewGraph.regularEdges.filter(
                (mEdge) =>
                  (!mEdge.isFailing || optionShowFailingEdges) &&
                  (mEdge.isPartOfTransitiveQuorumSet ||
                    !optionTransitiveQuorumSetOnly)
              )"
              :key="edge.key"
              v-bind:d="getEdgePath(edge)"
              :class="getEdgeClassObject(edge)"
            />
            <path
              class="edge"
              v-for="edge in viewGraph.stronglyConnectedEdges.filter(
                (mEdge) =>
                  (!mEdge.isFailing || optionShowFailingEdges) &&
                  (mEdge.isPartOfTransitiveQuorumSet ||
                    !optionTransitiveQuorumSetOnly)
              )"
              :key="edge.key"
              v-bind:d="getEdgePath(edge)"
              :class="getEdgeClassObject(edge)"
            />
            <g
              v-if="selectedVertices.length > 0 && optionHighlightTrustingNodes"
            >
              <path
                class="edge incoming"
                v-for="edge in viewGraph.trustingEdges.filter(
                  (mEdge) =>
                    (!mEdge.isFailing || optionShowFailingEdges) &&
                    (mEdge.isPartOfTransitiveQuorumSet ||
                      !optionTransitiveQuorumSetOnly)
                )"
                :key="edge.key + edge.key"
                v-bind:d="getEdgePath(edge)"
              />
            </g>
            <g
              v-if="selectedVertices.length > 0 && optionHighlightTrustedNodes"
            >
              <path
                class="edge outgoing"
                v-for="edge in viewGraph.trustedEdges.filter(
                  (mEdge) =>
                    (!mEdge.isFailing || optionShowFailingEdges) &&
                    (mEdge.isPartOfTransitiveQuorumSet ||
                      !optionTransitiveQuorumSetOnly)
                )"
                :key="edge.key + edge.key"
                v-bind:d="getEdgePath(edge)"
              />
            </g>
            <graph-strongly-connected-component
              :greatest="true"
              :vertex-coordinates="viewGraph.transitiveQuorumSetCoordinates"
            />
            <g v-if="!optionTransitiveQuorumSetOnly">
              <graph-strongly-connected-component
                :key="index"
                v-for="(
                  sccCoordinates, index
                ) in viewGraph.stronglyConnectedComponentCoordinates"
                :vertex-coordinates="sccCoordinates"
              />
            </g>
            <g
              :transform="getVertexTransform(vertex)"
              class="vertex"
              style="cursor: pointer"
              v-for="vertex in Array.from(
                viewGraph.viewVertices.values()
              ).filter(
                (mVertex) =>
                  mVertex.isPartOfTransitiveQuorumSet ||
                  !optionTransitiveQuorumSetOnly
              )"
              :key="vertex.key"
              v-on:click="vertexSelected(vertex)"
            >
              <circle :r="5" v-bind:class="getVertexClassObject(vertex)">
                <title>{{ vertex.label }}</title>
              </circle>
              <g>
                <rect
                  style="fill: white; opacity: 0.7; text-transform: lowercase"
                  :width="getVertexTextRectWidthPx(vertex)"
                  height="15px"
                  y="9"
                  :x="getVertexTextRectX(vertex)"
                  rx="2"
                  :class="{
                    'rect-selected': vertex.selected,
                    rect: !vertex.selected,
                  }"
                ></rect>
                <text
                  y="5"
                  :class="getVertexTextClass(vertex)"
                  dy="1.3em"
                  text-anchor="middle"
                  font-size="12px"
                >
                  {{ vertex.label | truncate(10) }}
                  <title>{{ vertex.label }}</title>
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from "vue-property-decorator";
import GraphLegend from "@/components/visual-navigator/graph/graph-legend.vue";

import * as zoom from "d3-zoom";
import { select, Selection } from "d3-selection";
import GraphStronglyConnectedComponent from "@/components/visual-navigator/graph/graph-strongly-connected-component.vue";
import { StoreMixin } from "@/mixins/StoreMixin";
import ViewVertex from "@/components/visual-navigator/graph/view-vertex";
import ViewGraph from "@/components/visual-navigator/graph/view-graph";
import ViewEdge from "@/components/visual-navigator/graph/view-edge";
import { isObject } from "@stellarbeat/js-stellar-domain/lib/typeguards";

@Component({
  components: {
    GraphStronglyConnectedComponent,
    GraphLegend,
  },
})
export default class Graph extends Mixins(StoreMixin) {
  @Prop()
  public centerVertex!: ViewVertex | undefined;
  @Prop()
  public selectedVertices!: ViewVertex[];

  @Prop({ default: false })
  public optionShowFailingEdges!: boolean;

  @Prop({ default: true })
  public optionHighlightTrustingNodes!: boolean;

  @Prop({ default: true })
  public optionHighlightTrustedNodes!: boolean;

  @Prop({ default: true })
  public optionShowRegularEdges!: boolean;

  @Prop({ default: true })
  public optionTransitiveQuorumSetOnly!: boolean;

  @Prop({ default: false })
  public fullScreen!: boolean;

  @Prop({ default: true })
  public isLoading!: boolean;

  @Prop()
  public viewGraph!: ViewGraph;

  public d3svg!: Selection<Element, null, null, undefined>;
  public d3Grid!: Selection<Element, null, null, undefined>;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  public graphZoom!: any;

  @Watch("centerVertex")
  public onCenterNodeChanged() {
    this.centerCorrectVertex();
  }

  @Watch("fullScreen")
  public onFullScreenChanged() {
    this.centerCorrectVertex();
    this.transformAndZoom();
  }

  @Watch("isLoading")
  public onIsLoadingChanged() {
    this.centerCorrectVertex();
  }

  vertexSelected(vertex: ViewVertex) {
    this.$emit("vertex-selected", vertex);
  }

  getVertexTransform(vertex: ViewVertex): string {
    return `translate(${vertex.x},${vertex.y})`;
  }

  getVertexTextRectWidth(vertex: ViewVertex) {
    if (!this.$options.filters) return 10;
    return (this.$options.filters.truncate(vertex.label, 10).length / 10) * 70;
  }

  getVertexTextRectWidthPx(vertex: ViewVertex) {
    return this.getVertexTextRectWidth(vertex) + "px";
  }

  getVertexTextRectX(vertex: ViewVertex) {
    return "-" + this.getVertexTextRectWidth(vertex) / 2 + "px";
  }

  getVertexTextClass(vertex: ViewVertex) {
    return {
      active: !vertex.isFailing,
      failing: vertex.isFailing,
      selected: vertex.selected,
    };
  }

  getVertexClassObject(vertex: ViewVertex) {
    return {
      active: !vertex.isFailing,
      selected: vertex.selected,
      failing: vertex.isFailing,
      target: this.highlightVertexAsIncoming(vertex) && !vertex.selected,
      source:
        this.highlightVertexAsOutgoing(vertex) &&
        !vertex.selected &&
        !this.highlightVertexAsIncoming(vertex),
      transitive: vertex.isPartOfTransitiveQuorumSet,
    };
  }

  highlightVertexAsOutgoing(vertex: ViewVertex) {
    if (this.selectedVertices.length <= 0) return false;
    let edges = this.selectedVertices
      .map((selectedVertex) =>
        this.viewGraph.viewEdges.get(vertex.key + ":" + selectedVertex.key)
      )
      .filter((edge) => edge !== undefined);
    let allEdgesAreFailing = edges.every(
      (edge) => (edge as ViewEdge).isFailing
    );

    if (edges.length <= 0) return false;

    return (
      vertex.isTrustingSelectedVertex &&
      this.optionHighlightTrustingNodes &&
      (!allEdgesAreFailing || this.optionShowFailingEdges)
    );
  }

  highlightVertexAsIncoming(vertex: ViewVertex) {
    if (this.selectedVertices.length <= 0) return false;

    let edges = this.selectedVertices
      .map((selectedVertex) =>
        this.viewGraph.viewEdges.get(selectedVertex.key + ":" + vertex.key)
      )
      .filter((edge) => edge !== undefined);
    let allEdgesAreFailing = edges.every(
      (edge) => (edge as ViewEdge).isFailing
    );

    if (edges.length <= 0) return false;

    return (
      vertex.isTrustedBySelectedVertex &&
      this.optionHighlightTrustedNodes &&
      (!allEdgesAreFailing || this.optionShowFailingEdges)
    );
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
      const realVertexX = -this.centerVertex.x + this.width() / 2;
      const realVertexY = -this.centerVertex.y + this.height() / 2;

      let transform = zoom.zoomIdentity
        .translate(realVertexX, realVertexY)
        .scale(1);
      this.d3svg.call(this.graphZoom.transform, transform);
    }
  }

  public mounted() {
    this.d3Grid = select(this.$refs.grid as Element);
    this.d3svg = select(this.$refs.graphSvg as Element);
    this.graphZoom = zoom
      .zoom()
      .on("zoom", (event) => {
        this.d3Grid.attr("transform", event.transform);
      })
      .scaleExtent([1, 3]);
    this.transformAndZoom();
  }

  transformAndZoom() {
    let transform = zoom.zoomIdentity
      .translate(this.width() / 2, this.height() / 2)
      .scale(1);
    this.d3svg.call(this.graphZoom).call(this.graphZoom.transform, transform);
  }

  getEdgeClassObject(edge: ViewEdge) {
    return {
      "strongly-connected": edge.isPartOfStronglyConnectedComponent,
      failing: edge.isFailing,
    };
  }

  getEdgePath(edge: ViewEdge) {
    if (!isObject(edge.source))
      throw new Error("Edge source not transformed into object by D3");
    if (!isObject(edge.target))
      throw new Error("Edge target not transformed into object by D3");
    return (
      "M" +
      edge.source.x +
      " " +
      edge.source.y +
      " L" +
      edge.target.x +
      " " +
      edge.target.y
    );
  }
}
</script>

<style lang="scss" scoped>
@import "src/assets/custom";
svg.graph {
  width: 100%;
  cursor: grab;
}

.dimmer.active .dimmer-content {
  opacity: 0.4;
}

path.edge {
  stroke: $graph-primary;
  stroke-width: 0.5px;
  stroke-opacity: 0.07;
  fill-opacity: 0;
}

path.strongly-connected {
  stroke: $graph-primary;
  stroke-width: 0.7px;
  stroke-opacity: 0.25;
}

path.failing {
  stroke: $red;
}

path.outgoing {
  stroke: #fec601;
  stroke-opacity: 0.9;
  stroke-width: 1.3px;
}

path.incoming {
  stroke: #73bfb8;
  stroke-opacity: 0.9;
  stroke-width: 1.3px;
}
circle.active {
  fill: $graph-primary;
}

circle.transitive {
  fill: $graph-primary;
}

circle.selected {
  stroke: $yellow;
  opacity: 0.6;
}

circle.failing {
  fill: $red;
}

circle.target {
  stroke: #fec601;
  stroke-opacity: 1;
}

circle.source {
  stroke: #73bfb8;
  stroke-opacity: 1;
}

circle {
  stroke: $white;
  fill: $gray-100;
  cursor: pointer;
  stroke-width: 1.5px;
}

text {
  fill: $graph-primary;
  font-weight: 400;
}

.failing {
  fill: $red;
  opacity: 0.7;
}

.selected {
  font-weight: bold;
}

.rect {
  opacity: 0.8;
}

.rect-selected {
  stroke: yellow;
  stroke-width: 1.5;
}
.svg-wrapper {
}
</style>
