<template>
    <div class="sb-nav-item">
        <nav-link
                title="Validators"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :dropDownShowing="showing"
                :showIcon="true"
                :icon="'fe-disc'"
                :show-sub-title="true"
                :sub-title="'Transitive quorumset'"
        />
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="node in paginatedNodes"
                    v-on:click="selectNode(node)"
                    :title="getDisplayName(node)"
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
    import {Node, Organization} from '@stellarbeat/js-stellar-domain';
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
            return this.paginate(this.nodes)
                .sort((nodeA:Node, nodeB:Node) => {
                if(nodeA.displayName > nodeB.displayName)
                    return 1;
                else return -1;
            });
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

        getDisplayName(node:Node) {
            if(node.name)
                return node.name;

            return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100)
        }
    }
</script>

<style scoped>

</style>


