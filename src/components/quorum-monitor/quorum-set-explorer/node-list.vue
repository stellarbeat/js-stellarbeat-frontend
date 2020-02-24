<template>
    <div class="pt-0">
        <div v-if="renderTitle" class="pt-2 pb-2 nodes-title active" v-on:click="toggleShow">
            <i class="chevron fe mr-1" v-bind:class="chevron"></i>
            <h5 class="mb-0">
                <span v-b-tooltip.hover v-if="renderOrganizationBadge" title="Tier one organization" class="badge sb-badge badge-primary">
                            <i class="fe fe-shield"/>
                        </span>
                {{title}}
            </h5>
        </div>
        <div v-if="showing" class="list-group list-group-flush nested-tree">
            <div class="list-group-item p-1 pr-0 node-list"
                 v-for="node in paginatedNodes">
                <a href="#" class="node-link"
                   v-on:click.prevent.stop="selectNode(node)">
                    <div v-bind:class="nodeState(node)">
                        <span v-b-tooltip.hover title="Full validator" v-if="node.isFullValidator" class="badge sb-badge badge-success">
                            <i class="fe fe-shield"/>
                        </span>
                        {{node.displayName | truncate(30)}}
                    </div>
                </a>
                <NodeActionBar :node="node" :network="network"
                               v-on:node-toggle-active="store.toggleActive(node)"
                               v-on:node-toggle-validating="store.toggleValidating(node)"
                               v-on:node-show-modal="showModal"></NodeActionBar>
            </div>
            <div class="pagination" v-if="nodes.length > 10">
                <b-pagination size="sm"
                              v-model="currentPage"
                              :total-rows="totalRows"
                              :per-page="perPage"
                              class="node-list-pagination"
                ></b-pagination>
            </div>
            <b-modal v-if="modalNode"
                     ok-title="Close" size="lg" ok-only id="node-details-modal" ref="modal"
                     v-bind:title="modalNode.displayName">
                <b-table stacked striped hover responsive :items="modalItems">
                </b-table>
            </b-modal>
        </div>
    </div>
</template>

<script lang="ts">
    import NodeActionBar from './node-action-bar.vue';

    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';

    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import {BModal} from 'bootstrap-vue';

    @Component({
        name: 'node-list',
        components: {
            NodeActionBar,
        },
    })
    export default class NodeList extends Vue {
        @Prop()
        public nodes!: Node[];
        @Prop()
        public network!: Network;
        @Prop()
        public title!: string;
        @Prop()
        public renderTitle!: boolean;
        @Prop({default: false})
        public renderOrganizationBadge!: boolean;

        public modalNode: Node | null = null;

        protected currentPage: number = 1;
        protected perPage: number = 10;

        protected showing: boolean = !this.renderTitle;

        get store(): Store {
            return this.$root.$data.store;
        }

        get modalItems() {
            if (!this.modalNode) {
                return [];
            }

            let item = JSON.parse(JSON.stringify(this.modalNode)); // clone it
            delete item.quorumSet;
            delete item.geoData;
            delete item.statistics;
            item = Object.assign(item, this.modalNode.geoData);
            item = Object.assign(item, this.modalNode.statistics);
            item.quorumSet = '';
            return [item];
        }

        get paginatedNodes() {
            return this.nodes
                .slice(
                    (this.currentPage - 1) * this.perPage, this.currentPage * this.perPage
                );
        }

        get totalRows() {
            return this.nodes.filter(node => node.active).length;
        }

        public selectNode(node: Node) {
            this.$router.push({
                name: 'quorum-monitor-node',
                params: {publicKey: node.publicKey!},
                query: {'center': '1', 'no-scroll': '1'},
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
            return this.showing ? 'fe-chevron-down' : 'fe-chevron-right';
        }

        public showModal(node: Node) {
            this.modalNode = node;
            this.$nextTick(function () {
                (this.$refs.modal as BModal).show();
            });
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

    .nodes-title {
        cursor: pointer;
    }

    .nodes-title:hover {
        background-color: #f8f9fa;
    }

    .pagination {
        margin-left: 10px;
        margin-top: 5px;
    }

    .node-list-pagination {
        margin-bottom: 5px;
    }

</style>


