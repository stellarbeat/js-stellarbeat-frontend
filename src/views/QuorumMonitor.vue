<style>
    .red {
        color: #f00;
    }

    .graph-toolbar {
        justify-content: flex-end;
        float: right;
    }

    .progress-bar-striped {
        background-color: #1997c6;
        opacity: 0.6;
    }
</style>

<template>
    <div>
        <div>
            <div v-show="updateQueue.hasUndo()" class="alert alert-warning" role="alert">
                You are viewing a simulation!
            </div>
            <div class="page-header  mt-2">
                <h1 class="page-title">
                    Quorum Monitor
                </h1>
                <div class="page-subtitle">Latest crawl on {{latestCrawlDateString}}</div>
            </div>
            <Statistics :network="network"></Statistics>
            <div class="row row-cards">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Quorum set explorer</h3>
                            <div class="pull-right">
                                <search :nodes="this.network.nodes"
                                        v-on:center-node="onNodeCenter"></search>
                            </div>
                        </div>
                        <div class="card-body" style="height: 100%">
                            <div class="row">
                                <div class="col-12 col-xl-8 graph-row">
                                    <Graph ref="graph" :network="network"
                                           v-on:center-node="onNodeCenter"
                                           :centerNode="centerNode"
                                           :selectedNode="selectedNode"
                                    ></Graph>
                                    <div class="text-right pt-1">
                                        <GraphLegend></GraphLegend>
                                    </div>
                                </div>
                                <div class="col-12 col-xl-4">
                                    <div class="row">
                                        <div class="col-8 pb-2">
                                            <div class="btn-group" role="group" aria-label="UndoRedo">
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                        v-on:click="undoUpdate" :disabled="!updateQueue.hasUndo()">
                                                    <i class="fe fe-rotate-ccw"></i>
                                                </button>
                                                <button type="button" class="btn btn-secondary btn-sm"
                                                        v-on:click="resetUpdates" :disabled="!updateQueue.hasUndo()">
                                                    Reset changes
                                                </button>
                                                <button type="button" class="btn btn-secondary btn-sm" v-on:click="redoUpdate"
                                                        :disabled="!updateQueue.hasRedo()">
                                                    <i class="fe fe-rotate-cw"></i>
                                                </button>
                                            </div>
                                            <!--div v-show="updateQueue.hasUndo"
                                                 class="alert alert-warning mt-0 mb-0 pt-0 pb-0" role="alert">
                                                You are viewing a simulation! TODO:FLEXBOX
                                            </div!-->
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-12">
                                            <router-view v-on:node-toggle-active="toggleActive"
                                                         v-on:center-node="onNodeCenter"
                                                         :network="network"
                                                         :selectedNode="selectedNode"
                                            >
                                            </router-view>
                                        </div>

                                    </div>
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <TomlConfigViewer :node="selectedNode" :network="network"></TomlConfigViewer>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row row-cards">
                <div class="col-12 col-md-6">

                    <div class="card mb-2">
                        <div class="card-header">
                            Manual
                        </div>
                        <div class="card-body">
                            <Manual></Manual>

                        </div>
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="card mb-2">
                        <div class="card-header">
                            Options
                        </div>
                        <div class="card-body">
                            <label class="custom-switch">
                                <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                                       v-model="optionNodeActiveBasedOnLatestCrawl">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description">Use latest crawl results for active status of nodes</span>
                            </label>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Graph from '../components/quorum-monitor/graph/graph.vue';
import GraphLegend from '../components/quorum-monitor/graph/graph-legend.vue';
import QuorumSetExplorer from '../components/quorum-monitor/quorum-set-explorer/quorum-set-explorer.vue';
import Search from '../components/quorum-monitor/search.vue';
import Statistics from '../components/statistics.vue';
import NodeList from '../components/quorum-monitor/quorum-set-explorer/node-list.vue';
import Manual from '../components/quorum-monitor/manual.vue';
import TomlConfigViewer from '../components/quorum-monitor/toml-config-viewer.vue'

import {Node, Network} from '@stellarbeat/js-stellar-domain';
import {Component, Prop, Watch} from 'vue-property-decorator';
import {EntityPropertyUpdateQueueManager} from '@/services/entity-property-update-queue-manager';
import {EntityPropertyUpdate} from '@/services/entity-property-update';

@Component({
    name: 'quorum-monitor',
    components: {
        QuorumSetExplorer,
        NodeList,
        Graph,
        GraphLegend,
        Search,
        Statistics,
        Manual,
        TomlConfigViewer
    },
    metaInfo: {
        title: 'Quorum monitor - Stellarbeat.io',
        meta: [
            {name: 'description', content: 'Inspect quorum set connections and metrics about network health'},
        ],
    },
})
export default class QuorumMonitor extends Vue {
    public searchString: string = '';
    public centerNode: Node|null = null;
    public selectedNode: Node|null = null;
    public simulatedNodes: Node[] = [];
    public optionNodeActiveBasedOnLatestCrawl: boolean = false;
    public updateQueue: EntityPropertyUpdateQueueManager = new EntityPropertyUpdateQueueManager();

    @Prop()
    public network!: Network;
    @Prop()
    public isLoading!: boolean;

    @Watch('optionNodeActiveBasedOnLatestCrawl')
    public onOptionNodeActiveBasedOnLatestCrawlChanged(activeInLastCrawl: boolean) {
        if (activeInLastCrawl === true) {
            this.network.nodes.forEach(
                (node) => node.active = node.statistics.activeInLastCrawl,
            );
        }
        if (activeInLastCrawl === false) {
            this.network.nodes.forEach(
                (node) => node.statistics.activeCounter > 0 ? node.active = true : node.active = false,
            );
        }

        this.network.updateNetwork(this.network.nodes);
        (this.$refs.graph as Graph).restartSimulation();
    }

    @Watch('$route')
    public on$routeChanged(to: any) {
        this.selectedNode = this.network.getNodeByPublicKey(to.params.publicKey);
        if (to.query.center === '1') {
            this.centerNode = this.selectedNode;
        }
    }

    public onNodeCenter(node: Node) {
        this.centerNode = node;
    }

    public toggleActive(node: Node) { // todo move to app
        let update = new EntityPropertyUpdate(node, 'active', !node.active);
        this.updateQueue.execute(update);
        this.network.updateNetwork();
        (this.$refs.graph as Graph).restartSimulation();
    }

    get latestCrawlDateString(): string {
        return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : 'NA';
    }

    get isSimulation(): boolean {
        return this.simulatedNodes.length > 0;
    }

    public undoUpdate() {
        if(!this.updateQueue.hasUndo()) {
            return;
        }
        this.updateQueue.undo();
        this.network.updateNetwork();
        (this.$refs.graph as Graph).restartSimulation();
    }

    public redoUpdate() {
        if(!this.updateQueue.hasRedo()) {
            return;
        }
        this.updateQueue.redo();
        this.network.updateNetwork();
        (this.$refs.graph as Graph).restartSimulation();
    }

    public resetUpdates() {
        if(!this.updateQueue.hasUndo()) {
            return;
        }
        this.updateQueue.reset();
        this.network.updateNetwork();
        (this.$refs.graph as Graph).restartSimulation();
    }
    public created() {
        // fix centering and selection in graph
        if (this.$route.params['publicKey']) {
            this.selectedNode = this.network.getNodeByPublicKey(this.$route.params['publicKey']);
        }
        if (this.$route.query['center'] === '1' || this.$route.query['center'] === undefined) {
            this.centerNode = this.selectedNode;
        }
    }

    public beforeDestroy() {
        if (this.isSimulation || this.optionNodeActiveBasedOnLatestCrawl) { // undo simulation
            this.simulatedNodes.forEach((node) => node.active = !node.active);
            if (this.optionNodeActiveBasedOnLatestCrawl) {
                this.network.nodes.forEach(
                    (node) => node.statistics.activeCounter > 0 ? node.active = true : node.active = false,
                );
            }
            this.network.updateNetwork(this.network.nodes);
        } // todo: better way to manage network adjustments
    }
}
</script>

<style scoped>
    .graph-row {
        margin-bottom: 10px;
    }

    .pull-right {
        margin-left: auto;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-order: 100;
        order: 100;
        margin-right: -.5rem;
        -ms-flex-item-align: center;
        align-self: center;
    }
</style>