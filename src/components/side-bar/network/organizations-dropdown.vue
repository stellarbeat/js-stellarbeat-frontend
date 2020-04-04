<template>
    <div class="sb-nav-item">
        <nav-link
                class="sb-nav-dropdown-title"
                title="Organizations"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :showIcon="true"
                :icon="'fe-grid'"
                :drop-down-showing="showing"
                :show-sub-title="true"
                :sub-title="'Transitive quorumset'"
        />
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="organization in paginatedOrganizations"
                    v-on:click="selectOrganization(organization)"
                    :title="organization.name | truncate(30)"
                    :is-link-in-dropdown="true"
                    :has-warnings="hasWarnings(organization)"
                    warnings="Not all history archives up-to-date"
            />
            <nav-pagination
                    v-model="currentPage"
                    v-on:input="currentPage = $event"
                    :total-rows="organizations.length"
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
    export default class OrganizationsDropdown extends Mixins(DropdownMixin) {
        @Prop()
        public organizations!: Organization[];

        get paginatedOrganizations() {
            return this.paginate(this.organizations)
                .sort((orgA:Organization, orgB:Organization) => {
                    if(orgA.name > orgB.name)
                        return 1;
                    else return -1;
                });
        }

        public selectOrganization(organization: Organization) {
            this.$router.push({
                name: "organization-dashboard",
                params: {organizationId: organization.id}
            });
        }

        public hasWarnings(organization: Organization) {
            return organization.validators
                .map(validator => this.network.getNodeByPublicKey(validator)!)
                .some(validator => validator.historyUrl && !validator.isFullValidator)
        }
    }
</script>

<style scoped>

</style>


