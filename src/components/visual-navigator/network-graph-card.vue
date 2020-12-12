<template>
    <Graph
        ref="graph"
        v-on:vertex-selected="vertexSelected"
        :centerVertex="centerVertex"
        :selectedVertex="selectedVertex"
        style="height: 100%"
        :fullScreen="fullScreen"
        :view-graph="viewGraph"
        :is-loading="isLoading"
        :optionShowFailingEdges="optionShowFailingEdges"
        :optionHighlightTrustingNodes="optionHighlightTrustingNodes"
        :optionHighlightTrustedNodes="optionHighlightTrustedNodes"
        :optionShowRegularEdges="optionShowRegularEdges"
        :optionTransitiveQuorumSetOnly="optionTransitiveQuorumSetOnly"
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

@Component({
    name: 'network-graph-card',
    components: {GraphLegend, Graph}
})
export default class NetworkGraphCard extends Mixins(StoreMixin) {
    public viewGraph: ViewGraph = new ViewGraph();
    public networkId!: string;
    public computeGraphWorker!: ComputeGraphWorker;
    public isLoading = true;

    @Prop({default: 'node'})
    public type!: string;

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

    @Watch('store.networkUpdated')
    public onNetworkUpdated() {
        if (this.networkId !== this.store.networkId) {
            this.viewGraph.reset();
        }
        this.updateGraph(true);
    }

    @Watch('store.selectedNode')
    public onSelectedNodeChanged() {
        let selectedKey = this.selectedKey;
        this.viewGraph.reClassifyEdges(selectedKey);
        this.viewGraph.reClassifyVertices(selectedKey);
    }

    @Watch('store.selectedOrganization')
    public onSelectedOrganizationIdChanged(){
        let selectedKey = this.selectedKey;
        this.viewGraph.reClassifyEdges(selectedKey);
        this.viewGraph.reClassifyVertices(selectedKey);
    }
    @Watch('type')
    public onTypeChanged() {
        this.updateGraph();
    }

    @Prop()
    fullScreen!: boolean;

    vertexSelected(vertex:ViewVertex){
        if(this.type === 'organization'){
            if(this.$route.params.organizationId && this.$route.params.organizationId === vertex.key)
                return;

            this.$router.push(
                {
                    name: 'organization-dashboard',
                    params: {organizationId: vertex.key},
                    query: {'center': '0', 'no-scroll': '1', 'view': this.$route.query.view, 'network': this.$route.query.network},
                },
            );
        } else {
            if(this.$route.params.publicKey && this.$route.params.publicKey === vertex.key)
                return;

            this.$router.push(
                {
                    name: 'node-dashboard',
                    params: {publicKey: vertex.key},
                    query: {'center': '0', 'no-scroll': '1', 'view': this.$route.query.view, 'network': this.$route.query.network},
                },
            );
        }
    }
    get selectedKey(){
        let selectedKey = undefined;
        if (this.type === 'node' && this.store.selectedNode)
            selectedKey = this.store.selectedNode.publicKey;
        else if (this.type === 'organization'){
            if(this.store.selectedOrganization)
                selectedKey = this.store.selectedOrganization.id;
            else if(this.store.selectedNode){
                selectedKey = this.store.selectedNode.organizationId;
            }
        }

        return selectedKey;
    }

    updateGraph(merge: boolean = false) {
        this.isLoading = true;

        if (this.type === 'node')
            this.viewGraph = ViewGraph.fromNodes(
                this.network,
                merge ? this.viewGraph : undefined,
                this.selectedKey);
        else
            this.viewGraph = ViewGraph.fromOrganizations(this.network, merge ? this.viewGraph : undefined, this.selectedKey);

        this.computeGraphWorker.postMessage({
            vertices: Array.from(this.viewGraph.viewVertices.values()),
            edges: Array.from(this.viewGraph.viewEdges.values()),
        });

    }

    get width() {
        let graph = this.$refs['graph'] as Graph;
        if (!graph)
            return;
        //@ts-ignore
        return graph.clientWidth;
    }

    get height() {
        let graph = this.$refs['graph'] as Graph;
        if (!graph)
            return;
        //@ts-ignore
        return graph.clientHeight;
    }

    get selectedVertex() {
        if (this.selectedKey && this.viewGraph)
            return this.viewGraph.viewVertices.get(this.selectedKey);
        return undefined;
    }

    get centerVertex() {
        if (this.store.centerNode && this.viewGraph)
            return this.viewGraph.viewVertices.get(this.store.centerNode.publicKey);
        return undefined;
    }

    mapViewGraph(vertices: any, edges: any) {
        vertices.forEach(
            (updatedVertex: any) => {
                let vertex = this.viewGraph.viewVertices.get(updatedVertex.key);
                if (!vertex)
                    return;
                vertex.x = updatedVertex.x;
                vertex.y = updatedVertex.y;
            }
        );

        edges.forEach((updatedEdge: any) => {
                let edge = this.viewGraph.viewEdges.get(updatedEdge.key);
                if (!edge)
                    return;
                edge.source = updatedEdge.source;
                edge.target = updatedEdge.target;
            }
        );
    }

    mounted() {
        if (this.type === 'node')
            this.viewGraph = ViewGraph.fromNodes(this.network, undefined, this.selectedKey);
        else
            this.viewGraph = ViewGraph.fromOrganizations(this.network, undefined, this.selectedKey);
        this.computeGraphWorker = new ComputeGraphWorker();
        this.networkId = this.store.networkId;

        this.computeGraphWorker.onmessage = (
            event: { data: { type: string, vertices: ViewVertex[], edges: ViewEdge[] } }
        ) => {
            switch (event.data.type) {
                case 'end': {
                    this.mapViewGraph(event.data.vertices, event.data.edges);
                    this.isLoading = false;
                }
                    break;
            }
        };

        this.computeGraphWorker.postMessage({
            vertices: Array.from(this.viewGraph.viewVertices.values()),
            edges: Array.from(this.viewGraph.viewEdges.values()),
        });
    }

    public beforeDestroy() {
        this.computeGraphWorker.terminate();
    }
}
</script>
<style scoped>

</style>