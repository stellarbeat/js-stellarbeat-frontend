<template>
    <div>
        <b-dropdown right size="sm" text="More" class="p-0 m-0" boundary="viewport" toggle-class="more-button btn-thin"
                    no-caret>
            <template slot="button-content">
                <b-icon-three-dots-vertical scale="0.9"/>
            </template>
            <b-dropdown-header>
                Simulation options
            </b-dropdown-header>
            <b-dropdown-item v-if="organization" v-on:click.prevent.stop="store.toggleOrganizationAvailability(organization)">
                <b-icon-lightning scale="0.9"/>
                {{ organization.subQuorumAvailable ? 'Halt this organization' : 'Try validating' }}
            </b-dropdown-item>
            <b-dropdown-item v-if="supportsDelete" v-on:click="() => {}" @click.prevent.stop>
                <b-icon-x-circle scale="0.9"/>
                Remove
            </b-dropdown-item>
            <b-dropdown-item v-if="supportsAdd" v-b-modal="'add-transitive-organization-modal-' + id"
                             @click.prevent.stop>
                <b-icon-plus-circle scale="0.9"/>
                Add organization
            </b-dropdown-item>
        </b-dropdown>
        <b-modal lazy size="lg" :id="'add-transitive-organization-modal-' + id"
                 title="Select organization to add"
                 ok-title="Add"
                 v-on:ok="organizationsToAddModalOk">
            <template slot="default" slot-scope="{ visible }">
                <AddOrganizationsTable v-if="visible" :organizations="possibleOrganizationsToAdd"
                                       v-on:organizations-selected="onOrganizationsSelected"/>
            </template>
        </b-modal>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop} from 'vue-property-decorator';
import {
    BDropdown,
    BDropdownItem,
    BIconThreeDotsVertical,
    BDropdownHeader,
    BIconXCircle,
    BIconPlusCircle,
    BIconGearWide,
    BIconLightning,
    BDropdownItemButton,
    BModal,
    VBModal
} from 'bootstrap-vue';

import {Organization} from '@stellarbeat/js-stellar-domain';
import Store from '@/store/Store';
import AddOrganizationsTable from '@/components/node/tools/simulation/add-organizations-table.vue';
import {StoreMixin} from '@/mixins/StoreMixin';

@Component({
    components: {
        AddOrganizationsTable,
        BDropdown,
        BDropdownItem,
        BIconThreeDotsVertical,
        BDropdownHeader,
        BIconXCircle,
        BIconGearWide,
        BIconLightning,
        BDropdownItemButton,
        BIconPlusCircle,
        BModal
    },
    directives: {'b-modal': VBModal}
})
export default class OrganizationActions extends Mixins(StoreMixin) {
    @Prop()
    public organization!: Organization;
    @Prop({default: false})
    public supportsDelete!: Boolean;
    @Prop({default: false})
    public supportsAdd!: Boolean;

    public organizationsToAdd: Organization[] = [];
    public id!:number;

    public get possibleOrganizationsToAdd() {
        let transitiveNodes = Array.from(this.network.nodesTrustGraph.networkTransitiveQuorumSet)
            .map(publicKey => this.network.getNodeByPublicKey(publicKey)!);
        let transitiveOrganizations =
            transitiveNodes
                .filter(node => node && node.organizationId)
                .map(node => node!.organizationId!);

        return this.store.network.organizations
            .filter((organization) => transitiveOrganizations.indexOf(organization.id) < 0);
    }

    organizationsToAddModalOk(bvEvent: any, modalId: string) {
        if (this.organizationsToAdd.length > 0) {
            this.store.addOrganizationToTransitiveQuorumSet(this.organizationsToAdd)
        }
    }

    onOrganizationsSelected(organizations:Organization[]){
        this.organizationsToAdd = organizations;
    }

    created(){
        this.id = this.store.getUniqueId();
    }
}
</script>