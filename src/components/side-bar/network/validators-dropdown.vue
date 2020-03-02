<template>
    <div class="sb-nav-item">
        <nav-link title="Validators" v-on:click="toggleShow" :dropdownToggle="true"/>
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-dropdown-link
                    v-for="node in paginatedNodes"
                    v-on:click="selectNode(node)"
                    :title="node.displayName | truncate(30)"/>
            <div class="sb-nav-pagination" v-if="nodes.length > 10">
                <b-pagination size="sm"
                              v-model="currentPage"
                              :total-rows="nodes.length"
                              :per-page="perPage"
                              first-number
                              last-number
                              align="left"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Mixins} from 'vue-property-decorator';
    import {Node} from '@stellarbeat/js-stellar-domain';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import {DropdownMixin} from '@/components/side-bar/network/dropdown-mixin';
    import NavDropdownLink from '@/components/side-bar/nav-dropdown-link.vue';

    @Component({
        components: {
            NavDropdownLink,
            NavLink
            //NodeActionBar,
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


