<template>
    <div class="sb-nav-item">
        <nav-link title="Organizations" v-on:click="toggleShow" :dropdownToggle="true"/>
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-dropdown-link
                    v-for="organization in paginatedOrganizations"
                    v-on:click="selectOrganization(organization)"
                    :title="organization.name | truncate(30)"/>
            <div class="sb-nav-pagination" v-if="organizations.length > 10">
                <b-pagination size="sm"
                              v-model="currentPage"
                              :total-rows="organizations.length"
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
    import {Node, Organization} from '@stellarbeat/js-stellar-domain';
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
    export default class OrganizationsDropdown extends Mixins(DropdownMixin) {
        @Prop()
        public organizations!: Organization[];

        get paginatedOrganizations() {
            return this.paginate(this.organizations);
        }

        public selectOrganization(organization: Organization) {
            this.$router.push({
                name: "organization-details",
                params: {organizationId: organization.id}
            });
        }
    }
</script>

<style scoped>

</style>


