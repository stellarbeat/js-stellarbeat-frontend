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
                            <GraphLink v-if="graphInitialized" v-for="link in network.links" :link="link"
                                       :selectedNode="selectedNode" :key="link.id"></GraphLink>
                            <GraphNode v-if="graphInitialized" v-for="node in network.nodes" :key="node.publicKey" :node="node"
                                       :selectedNode="selectedNode"
                                       :network="network" :targetNodes="targetNodes" :sourceNodes="sourceNodes"
                                       ></GraphNode>
                        </g>

                    </svg>
                </div>
            </div>
        </div>
    </div>

</template>

<script lang="ts">
import Vue from 'vue';
import {Network, Node} from '@stellarbeat/js-stellar-domain';
import GraphNode from './graph-node.vue';
import GraphLink from './graph-link.vue';
import svgPanZoom from 'svg-pan-zoom';

import ComputeGraphWorker from 'worker-loader?name=dist/[name].js!./../../../workers/compute-graphv4.worker';
import {Component, Prop, Watch} from 'vue-property-decorator';

const _ComputeGraphWorker: any = ComputeGraphWorker; // workaround for typescript not compiling web workers.

@Component({
    components: {
        GraphNode,
        GraphLink,
    },
})
export default class Graph extends Vue {
    public name: string = 'graph';
    public panZoom!: SvgPanZoom.Instance;
    public isLoading: boolean = true;
    public graphInitialized: boolean = false;
    public loadingProgress: number = 0;
    public computeGraphWorker = new _ComputeGraphWorker();

    @Prop()
    public network!: Network;
    @Prop()
    public centerNode!: Node;
    @Prop()
    public selectedNode!: Node;

    @Watch('centerNode')
    public onCenterNodeChanged() {
        if (this.graphInitialized) {
            this.centerCorrectNode();
        }
    }

    get progressBarWidth() {
        return 'width: ' + this.loadingProgress + '%';
    }

    get sourceNodes() {
        return this.network.links
            .filter((link) => link.target === this.selectedNode)
            .map((link) => link.source);
    }

    get targetNodes() {
        return this.network.links
            .filter((link) => link.source === this.selectedNode)
            .map((link) => link.target);
    }

    get dimmerClass() {
        return {
            dimmer: true,
            active: this.isLoading,
        };
    }

    public restartSimulation() {
        this.computeGraph();
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

    public computeGraph() {
        this.isLoading = true;
        // separate sim nodes to avoid slow rendering
        const simulationNodes = this.network.nodes.map((node, index) => {
            return {
                publicKey: node.publicKey,
                x: (node as any).x,
                y: (node as any).y,
                index,
            };
        });

        const simulationLinks = this.network.links.map((link, index) => {
            return {
                source: link.source.publicKey,
                target: link.target.publicKey,
                isClusterLink: link.isClusterLink,
                index,
            };
        });

        this.computeGraphWorker.postMessage({
            nodes: simulationNodes,
            links: simulationLinks,
        });

    }
    public created() {
        this.network.nodes.forEach((node) => {
            this.$set(node, 'x', 0);
            this.$set(node, 'y', 0);
        }); // trigger reactive changes on newly added x and y coordinates

        this.computeGraphWorker.onmessage = (event: any) => {
            switch (event.data.type) {
                case 'tick': {
                    // if(newLoadingProgress % 25 === 0)
                    //this.loadingProgress = Math.round(event.data.progress * 100);
                }
                break;
                case 'end': {
                    event.data.nodes.forEach(
                        (node: {index: number, x: number, y: number, publicKey: string}) => {
                            (this.network.nodes[node.index] as any).x = node.x;
                            (this.network.nodes[node.index] as any).y = node.y;
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