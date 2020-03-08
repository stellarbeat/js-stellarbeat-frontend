<template>
    <div class="sb-nav-item">
        <nav-link class="sb-nav-dropdown-title" title="Validators" v-on:click="toggleShow" :showDropdownToggle="true"/>
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="node in paginatedNodes"
                    v-on:click="selectNode(node)"
                    :title="node.displayName | truncate(30)"
                    :isLinkInDropdown="true"
            >
                <template v-slot:action-dropdown>
                    <node-action-bar :node="node"/>
                </template>
            </nav-link>
            <nav-pagination v-model="currentPage" v-on:input="currentPage = $event" :total-rows="nodes.length"/>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Mixins} from 'vue-property-decorator';
    import {Node} from '@stellarbeat/js-stellar-domain';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import {DropdownMixin} from '@/components/side-bar/network/dropdown-mixin';
    import NavDropdownLink from '@/components/side-bar/nav-dropdown-link.vue';
    import NavPagination from '@/components/side-bar/nav-pagination.vue';
    import NodeActionBar from '@/components/quorum-monitor-deprecated/quorum-set-explorer/node-action-bar.vue';

    @Component({
        components: {
            NodeActionBar,
            NavPagination,
            NavLink
        },
    })
    export default class ValidatorsDropdown extends Mixins(DropdownMixin) {
        @Prop()
        public nodes!: Node[];

        get paginatedNodes() {
            return this.paginate(this.nodes);
        }

        public selectNode(node: Node) {
            this.$router.push({
                name: 'network-node',
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
    }
</script>

<style scoped>

</style>


