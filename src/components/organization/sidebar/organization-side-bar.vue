<template>
    <side-bar :sticky-key="selectedOrganization.id" icon="building">
        <template v-slot:title>
            {{selectedOrganization.name}}
        </template>
        <template v-slot:sub-title>
            <h6 class="sb-card-subtitle">
                {{organizationType}}
                <b-badge v-if="failAt <= 0" variant="danger"
                         v-b-tooltip:hover="'More then 50% of its validators are failing'">Failing
                </b-badge>
            </h6>
        </template>
        <template v-slot:explore-list-items>
            <li class="sb-nav-item">
                <organization-validators-dropdown :organization="selectedOrganization"
                                                  :expand="true"/>
            </li>
        </template>
        <template v-slot:tool-list-items>
            <li class="sb-nav-item">
                <nav-link
                        :title="'Export configuration'"
                        v-b-modal.tomlExportModal
                        :show-icon="true"
                        icon="download"
                />
            </li>
            <li class="sb-nav-item">
                <nav-link
                        v-b-modal.simulate-node-modal
                        :title="'Simulate new node'"
                        :show-icon="true"
                        icon="plus"
                />
                <simulate-new-node/>
            </li>
        </template>
    </side-bar>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import OrganizationValidatorsDropdown
        from '@/components/organization/sidebar/organization-validators-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import stickybits from 'stickybits';
    import SideBar from '@/components/side-bar/side-bar.vue';

    @Component({
        components: {
            SideBar,
            SimulateNewNode,
            NavLink,
            OrganizationValidatorsDropdown
        }
    })
    export default class OrganizationSideBar extends Vue {

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
        }

        get organizationType() {
            return this.selectedOrganization!.isTierOneOrganization ? 'T1 Organization' : 'Organization';
        }

        get network() {
            return this.store.network;
        }

        get tomlNodesExport() {
            return '';
        }

        get failAt() {
            let nrOfValidatingNodes = this.selectedOrganization!.validators
                .map(validator => this.network.getNodeByPublicKey(validator))
                .filter(validator => validator !== undefined)
                .filter(node => node!.isValidating).length;

            return nrOfValidatingNodes - this.selectedOrganization!.subQuorumThreshold + 1;
        }
    }
</script>
<style scoped>
    .sb-bg-primary {
        background-color: #1997c6;
    }
</style>