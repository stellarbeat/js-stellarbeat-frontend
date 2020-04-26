<template>
    <div class="sb-nav-item">
        <nav-link
                class="sb-nav-dropdown-title"
                :title="'Validators'"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :drop-down-showing="showing"
        />
        <div v-show="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="validator in validators"
                    v-on:click="selectValidator(validator)"
                    :title="getDisplayName(validator)"
                    :is-link-in-dropdown="true"
                    :has-danger="network.isNodeFailing(validator)"
                    :dangers="'Node not validating ' + (network.isQuorumSetFailing(validator) ? ': quorumset not reaching threshold' : '')"
                    :has-warnings="validator.historyUrl && !validator.isFullValidator"
                    warnings="History archive not up-to-date"
            >
                <template v-slot:action-dropdown>
                    <node-actions :node="validator"/>
                </template>
            </nav-link>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Mixins} from 'vue-property-decorator';
    import {Node, Organization} from '@stellarbeat/js-stellar-domain';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import {DropdownMixin} from '@/components/side-bar/dropdown-mixin';
    import NavPagination from '@/components/side-bar/nav-pagination.vue';
    import NodeActions from '@/components/node/sidebar/node-actions.vue';

    @Component({
        components: {
            NodeActions,
            NavPagination,
            NavLink
        },
    })
    export default class OrganizationValidatorsDropdown extends Mixins(DropdownMixin) {
        @Prop()
        public organization!: Organization;

        get validators() {
            return this.organization.validators.map(validator => this.network.getNodeByPublicKey(validator));
        }

        getDisplayName(node: Node) {
            if(node.name)
                return node.name;

            return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100)
        }

        public selectValidator(validator: Node) {
            this.$router.push({
                name: 'node-dashboard',
                params: {publicKey: validator.publicKey!},
                query: {'center': '1', 'no-scroll': '0', 'view': this.$route.query.view},
            });
        }
    }
</script>

<style scoped>

</style>


