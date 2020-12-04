<template>
    <Graph
        ref="graph"
        :centerVertex="centerVertex"
        :selectedVertex="selectedVertex"
        style="height: 100%"
        :fullScreen="fullScreen"
        :view-graph="viewGraph"
        :is-loading="isLoading"
    />
</template>

<script lang="ts">
import {Component, Mixins, Prop, Watch} from 'vue-property-decorator';
import Graph from '@/components/visual-navigator/graph/graph.vue';
import GraphLegend from '@/components/visual-navigator/graph/graph-legend.vue';
import {StoreMixin} from '@/mixins/StoreMixin';
import ComputeGraphWorker from 'worker-loader?name=worker/[name].js!../../workers/compute-graphv9.worker';
import ViewGraph from '@/components/visual-navigator/graph/view-graph';
import ViewVertex from '@/components/visual-navigator/graph/view-vertex';
import ViewEdge from '@/components/visual-navigator/graph/view-edge';
const _ComputeGraphWorker: any = ComputeGraphWorker; // workaround for typescript not compiling web workers.

@Component({
    name: 'network-graph-card',
    components: {GraphLegend, Graph}
})
export default class NetworkGraphCard extends Mixins(StoreMixin) {
    public viewGraph!: ViewGraph;
    public networkId!:string;
    public computeGraphWorker!:ComputeGraphWorker;
    public isLoading = true;

    @Watch('store.networkUpdated')
    public onNetworkUpdated() {
        if (this.networkId !== this.store.networkId) {
            this.viewGraph.reset();
        }
        this.updateGraph();
    }

    @Watch('store.selectedNode')
    public onSelectedNodeChanged(){
        let selectedKey = undefined;
        if(this.store.selectedNode)
            selectedKey = this.store.selectedNode.publicKey;

        this.viewGraph.reClassifyEdges(selectedKey);
        this.viewGraph.reClassifyVertices(selectedKey);
    }

    @Prop()
    fullScreen!: boolean;

    updateGraph(){
        this.isLoading = true;
        this.viewGraph = ViewGraph.fromNodes(this.network, this.viewGraph, this.store.selectedNode ? this.store.selectedNode.publicKey : undefined);

        this.computeGraphWorker.postMessage({
            vertices: Array.from(this.viewGraph.viewVertices.values()),
            edges: Array.from(this.viewGraph.viewEdges.values()),
            width: this.width,
            height: this.height
        });

    }

    get width() {
        let graph = this.$refs['graph'] as Graph;
        if(!graph)
            return;
        //@ts-ignore
        return graph.clientWidth;
    }

    get height() {
        let graph = this.$refs['graph'] as Graph;
        if(!graph)
            return;
        //@ts-ignore
        return graph.clientHeight;
    }

    get selectedVertex(){
        if(this.store.selectedNode)
            return this.viewGraph.viewVertices.get(this.store.selectedNode.publicKey);
        return undefined;
    }

    get centerVertex(){
        if(this.store.centerNode)
            return this.viewGraph.viewVertices.get(this.store.centerNode.publicKey);
        return undefined;
    }

    created() {
        this.viewGraph = ViewGraph.fromNodes(this.network, undefined, this.store.selectedNode ? this.store.selectedNode.publicKey : undefined);
    }

    mounted(){
        this.computeGraphWorker = new ComputeGraphWorker();
        this.networkId = this.store.networkId;
        this.computeGraphWorker.onmessage = (
            event: { data: { type: string, vertices: ViewVertex[], edges: ViewEdge[] } }
        ) => {
            switch (event.data.type) {
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
                    this.isLoading = false;
                }
                break;
           }
        };
        this.computeGraphWorker.postMessage({
            vertices: Array.from(this.viewGraph.viewVertices.values()),
            edges: Array.from(this.viewGraph.viewEdges.values()),
            width: this.width,
            height: this.height
        });
    }

    public beforeDestroy() {
        this.computeGraphWorker.terminate();
    }
}
</script>
<style scoped>

</style>