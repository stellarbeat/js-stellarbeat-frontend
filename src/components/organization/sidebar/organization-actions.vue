<template>
        <b-dropdown right size="sm" text="More" class="p-0 m-0" boundary="viewport" toggle-class="more-button btn-thin" no-caret>
            <template slot="button-content">
                <b-icon-three-dots-vertical scale="0.9"/>
            </template>
            <b-dropdown-header>
                Simulation options
            </b-dropdown-header>
            <b-dropdown-item v-on:click.prevent.stop="store.toggleOrganizationAvailability(organization)">
                <b-icon-lightning scale="0.9"/>
                {{organization.subQuorumAvailable? 'Halt this organization' : 'Try validating'}}
            </b-dropdown-item>
            <b-dropdown-item v-if="supportsDelete" v-on:click="() => {}" @click.prevent.stop>
                <b-icon-x-circle scale="0.9"/>
                Remove
            </b-dropdown-item>
       </b-dropdown>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import {BDropdown, BDropdownItem, BIconThreeDotsVertical, BDropdownHeader, BIconXCircle, BIconGearWide, BIconLightning, BDropdownItemButton} from 'bootstrap-vue';

    import {Organization} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';

    @Component({
        components: {BDropdown, BDropdownItem, BIconThreeDotsVertical, BDropdownHeader, BIconXCircle, BIconGearWide, BIconLightning, BDropdownItemButton}
    })
    export default class OrganizationActions extends Vue {
        @Prop()
        public organization!: Organization;
        @Prop({default: false})
        public supportsDelete!: Boolean;

        get store():Store {
            return this.$root.$data.store;
        }
    }
</script>