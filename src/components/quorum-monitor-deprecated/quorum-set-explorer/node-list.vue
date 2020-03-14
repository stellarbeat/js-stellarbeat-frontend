<template>
    <div class="">
        <NavLink :title="title" :toggle-show="toggleShow" :dropdown-toggle="true"/>
        <div v-if="showing" class="sb-nav-dropdown">
            <div class="sb-nav-dropdown-link"
                 v-for="node in paginatedNodes"
                 v-on:click.prevent.stop="selectNode(node)">
                <div class="sb-nav-link-title">
                    {{node.displayName | truncate(30)}}
                </div>
                <NodeActionBar v-show="showActions" :node="node" :network="network"
                               v-on:node-toggle-active="store.toggleActive(node)"
                               v-on:node-toggle-validating="store.toggleValidating(node)"
                               v-on:node-show-modal="showModal"></NodeActionBar>
            </div>
            <div class="sb-nav-pagination" v-if="nodes.length > 10">
                <b-pagination size="sm"
                              v-model="currentPage"
                              :total-rows="totalRows"
                              :per-page="perPage"
                              class="dropdown-pagination"
                              page-class="pagination-page-class"
                              first-number
                              last-number
                              align="left"
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
    import NavLink from '@/components/side-bar/nav-link.vue';

    @Component({
        name: 'node-list',
        components: {
            NavLink,
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
        @Prop({default: false})
        expand!: boolean;

        public modalNode: Node | null = null;

        protected currentPage: number = 1;
        protected perPage: number = 10;

        protected showing: boolean = this.expand;

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
                name: 'node-dashboard',
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

    .sb-nav-pagination {
        margin-top: 1px;
    }

    .dropdown-pagination {
        margin-bottom: 5px;
        border: none;
    }

    .sb-nav-link-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        display: block;
        margin-right: .5rem;
        line-height: .99;
    }

    .sb-nav-dropdown {
        margin-left: 0em;
    }

    .sb-nav-dropdown-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: rgba(0, 0, 0, .55);
        width: 100%;
        font-weight: 400;
        font-size: 90%;
        padding: .1rem 0rem;
    }

    .sb-nav-dropdown-link:hover {
        background-color: #f8f9fa;
    }

</style>


