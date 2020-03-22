<template>
    <div class="sb-nav-item">
        <nav-link
                class="sb-nav-dropdown-title"
                :title="organization.name"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :showIcon="true"
                :icon="'fe-grid'"
                :drop-down-showing="showing"
                :sub-title="'organization'"
                :show-sub-title="true"
        />
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="validator in organization.validators"
                    v-on:click="selectValidator(validator)"
                    :title="getDisplayName(validator)"
                    :is-link-in-dropdown="true"
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
    import {DropdownMixin} from '@/components/side-bar/network/dropdown-mixin';
    import NavPagination from '@/components/side-bar/nav-pagination.vue';
    import NodeActions from '@/components/side-bar/node/node-actions.vue';

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

        getDisplayName(validator: string) {
            let node = this.network.getNodeByPublicKey(validator)!;
            if(node.name)
                return node.name;

            return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100)
        }

        public selectValidator(validator: string) {
            this.$router.push({
                name: 'node-dashboard',
                params: {publicKey: validator},
                query: {'center': '1', 'no-scroll': '1'},
            });
        }
    }
</script>

<style scoped>

</style>


