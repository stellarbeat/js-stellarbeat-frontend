<template>
    <div class="sb-nav-item">
        <nav-link
                class="sb-nav-dropdown-title"
                :title="'Trusted Organizations'"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :drop-down-showing="showing"
        />
        <div v-show="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="organization in trustedOrganizations"
                    :key="organization.id"
                    v-on:click="selectOrganization(organization)"
                    :title="organization.name"
                    :is-link-in-dropdown="true"
                    :has-danger="network.isOrganizationFailing(organization)"
                    :dangers="'Not available'"
                    :has-warnings="false"
                    warnings=""
            >
                <template v-slot:action-dropdown>
                    <!--node-actions :node="validator"/!-->
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

        get trustedOrganizations() {
            let trustedOrganizations = new Set<Organization>();
            this.organization.validators.forEach(publicKey => {
                let validator = this.network.getNodeByPublicKey(publicKey)!;
                this.network.getTrustedOrganizations(validator.quorumSet).forEach(org => {
                    if(org.id !== this.organization.id)
                        trustedOrganizations.add(org)
                });
            })
            return Array.from(trustedOrganizations);
        }

        public selectOrganization(organization: Organization) {
            this.$router.push({
                name: 'organization-dashboard',
                params: {organizationId: organization.id},
                query: {'center': '1', 'no-scroll': '0', 'view': this.$route.query.view},
            });
        }
    }
</script>

<style scoped>

</style>


