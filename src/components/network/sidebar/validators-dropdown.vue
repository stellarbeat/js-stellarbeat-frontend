<template>
    <div class="sb-nav-item">
        <nav-link
            title="Validators"
            v-on:click="toggleShow"
            :showDropdownToggle="true"
            :dropDownShowing="showing"
            :show-sub-title="true"
            :sub-title="'Transitive quorum set'"
            :has-warnings="hasGeneralValidatorsWarning"
            warnings="Some nodes are down or not all history archives up-to-date"
        />

        <div v-show="showing" class="sb-nav-dropdown">
            <LazyHydrate when-visible>
                <div>
                    <nav-link
                        v-for="node in paginatedNodes"
                        :key="node.publicKey"
                        v-on:click="selectNode(node)"
                        :title="getDisplayName(node)"
                        :isLinkInDropdown="true"
                        :has-warnings="hasWarnings(node)"
                        :warnings="warnings()"
                        :has-danger="network.isNodeFailing(node)"
                        :dangers="'Node not validating'"
                    >
                        <template v-slot:action-dropdown>
                            <node-actions :node="node"/>
                        </template>
                    </nav-link>
                    <nav-pagination v-model="currentPage" v-on:input="currentPage = $event" :total-rows="nodes.length"/>

                </div>
            </LazyHydrate>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Mixins} from 'vue-property-decorator';
import {Node, Organization} from '@stellarbeat/js-stellar-domain';
import NavLink from '@/components/side-bar/nav-link.vue';
import {DropdownMixin} from '@/components/side-bar/dropdown-mixin';
import NavDropdownLink from '@/components/side-bar/nav-dropdown-link.vue';
import NavPagination from '@/components/side-bar/nav-pagination.vue';
import NodeActions from '@/components/node/sidebar/node-actions.vue';
import LazyHydrate from 'vue-lazy-hydration';

@Component({
    components: {
        NodeActions,
        NavPagination,
        NavLink,
        LazyHydrate
    },
})
export default class ValidatorsDropdown extends Mixins(DropdownMixin) {
    @Prop()
    public nodes!: Node[];

    get sortedNodes() {
        let sort = (nodeA: Node, nodeB: Node) => {
            return nodeA.displayName.localeCompare(nodeB.displayName);
        };

        let failingNodes = this.nodes.filter(node => this.network.isNodeFailing(node)).sort(sort);
        let nonFailingNodes = this.nodes.filter(node => !this.network.isNodeFailing(node)).sort(sort);
        return failingNodes.concat(nonFailingNodes);
    }

    get paginatedNodes() {
        return this.paginate(this.sortedNodes);
    }

    hasWarnings(node: Node) {
        return node.historyUrl && !node.isFullValidator;
    }

    get hasGeneralValidatorsWarning() {
        return this.nodes.some(node => this.hasWarnings(node) || this.network.isNodeFailing(node));
    }

    warnings() {
        return 'History archive not up-to-date';
    }

    public selectNode(node: Node) {
        this.$router.push({
            name: 'node-dashboard',
            params: {publicKey: node.publicKey!},
            query: {
                'center': '1',
                'no-scroll': '0',
                'view': this.$route.query.view,
                'network': this.$route.query.network
            },
        });
    }

    public nodeState(node: Node) {
        return {
            inactive: !node.active,
            active: node.active,
            failing: this.network.isNodeFailing(node),
        };
    }

    getDisplayName(node: Node) {
        if (node.name)
            return node.name;

        return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100);
    }
}
</script>

<style scoped>

</style>


