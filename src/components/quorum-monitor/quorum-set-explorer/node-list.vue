<template>
    <div class="pt-1">
        <div class="trusting-nodes-title active" v-on:click="toggleShow">
            <i class="chevron fe mr-1" v-bind:class="chevron"></i>
            <h5>Trusted by
                {{nodes.filter(node => node.active).length}} active nodes
            </h5>
        </div>
        <div v-if="showing" class="list-group list-group-flush nested-tree">
            <div class="list-group-item p-1 pr-0 node-list"
                 v-for="node in paginatedNodes">
                <a href="#" class="node-link"
                   v-on:click.prevent.stop="selectNode(node)">
                    <div v-bind:class="nodeState(node)">
                        {{node.displayName | truncate(30)}}
                    </div>
                </a>
                <NodeActionBar :node="node" :network="network"
                               v-on:node-toggle-active="toggleActive(node)"
                               v-on:node-show-modal="showModal"></NodeActionBar>
            </div>
            <div class="pagination" v-if="nodes.length > 0">
                <b-pagination size="sm"
                              v-model="currentPage"
                              :total-rows="totalRows"
                              :per-page="perPage"
                ></b-pagination>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import NodeActionBar from "./node-action-bar.vue";

    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Network, Node} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "node-list",
        components: {
            NodeActionBar,
        },
    })
    export default class NodeList extends Vue {
        @Prop()
        public nodes!: Node[];
        @Prop()
        public network!: Network;

        protected currentPage: number = 1;
        protected perPage: number = 10;

        protected showing: boolean = false;

        get paginatedNodes() {
            return this.nodes
                .filter(node => node.active)
                .slice(
                    (this.currentPage - 1) * this.perPage, this.currentPage * this.perPage
                );
        }

        get totalRows() {
            return this.nodes.length;
        }

        public toggleActive(node: Node) {
            this.$emit("node-toggle-active", node);
        }

        public selectNode(node: Node) {
            this.$router.push({
                name: "quorum-monitor-node",
                params: {publicKey: node.publicKey},
                query: {"center": "1", "no-scroll": "1"},
            });
        }

        public nodeState(node: Node) {
            return {
                inactive: !node.active,
                active: node.active,
                failing: this.network.isNodeFailing(node),
            };
        }

        get chevron(): string { //todo should be moved to higher up component & code reuse
            return this.showing ? "fe-chevron-down" : "fe-chevron-right";
        }

        public showModal(node: Node) {
            this.$emit("node-show-modal", node);
        }

        toggleShow(): void {
            this.showing = !this.showing;
        }
    }
</script>

<style scoped>
    .node-list {
        display: flex;
        justify-content: space-between;
        margin-left: 20px;
    }

    .node-link {
        width: 100%;
    }

    .inactive {
        color: #c3c2bb
    }

    .active {
        color: #1997c6
    }

    .failing {
        color: red
    }

    a:hover, a:visited, a:link, a:active {
        text-decoration: none;
    }

    a:hover {
        background-color: #f8f9fa;
    }

    .chevron {
        float: left;
    }

    .trusting-nodes-title {
        cursor: pointer;
    }

    .pagination {
        margin-left: 10px;
        margin-top: 5px;
    }

</style>


