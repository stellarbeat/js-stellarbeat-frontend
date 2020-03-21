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
                    v-on:click=""
                    :title="validator"
                    :is-link-in-dropdown="true"
            />
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Mixins} from 'vue-property-decorator';
    import {Organization} from '@stellarbeat/js-stellar-domain';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import {DropdownMixin} from '@/components/side-bar/network/dropdown-mixin';
    import NavDropdownLink from '@/components/side-bar/nav-dropdown-link.vue';
    import NavPagination from '@/components/side-bar/nav-pagination.vue';

    @Component({
        components: {
            NavPagination,
            NavLink
            //NodeActionBar,
        },
    })
    export default class OrganizationValidatorsDropdown extends Mixins(DropdownMixin) {
        @Prop()
        public organization!: Organization;
    }
</script>

<style scoped>

</style>


