<template>
    <side-bar v-if="selectedOrganization" :sticky-key="selectedOrganization.id" icon="building">
        <template v-slot:title>
            {{selectedOrganization.name}}
        </template>
        <template v-slot:sub-title>
                {{organizationType}}
                <b-badge v-if="network.isOrganizationFailing(selectedOrganization)" variant="danger"
                         v-b-tooltip:hover="store.getOrganizationFailingReason(selectedOrganization)">
                    {{network.isOrganizationBlocked(selectedOrganization) ? 'Blocked': 'Failing' }}
                </b-badge>
                <b-badge v-else-if="store.organizationHasWarnings(selectedOrganization)" variant="warning"
                        v-b-tooltip:hover="store.getOrganizationWarningReason(selectedOrganization)">
                        Warning
                </b-badge>
        </template>
        <template v-slot:explore-list-items>
            <li class="sb-nav-item">
                <organization-validators-dropdown :organization="selectedOrganization"
                                                  :expand="true"/>
            </li>
            <li class="sb-nav-item">
                <trusted-organizations-dropdown :organization="selectedOrganization"
                                                  :expand="true"/>
            </li>
        </template>
        <template v-slot:tool-list-items>
            <li class="sb-nav-item" v-if="!network.isOrganizationBlocked(selectedOrganization)">
                <nav-link
                    :title="selectedOrganization.subQuorumAvailable ? 'Halt this organization' : 'Start validating'"
                    :show-icon="true"
                    :icon="selectedOrganization.subQuorumAvailable ? 'lightning-fill' : 'lightning'"
                    v-on:click="store.toggleOrganizationAvailability(selectedOrganization)"
               />
            </li>
            <li class="sb-nav-item">
                <nav-link
                        :title="'Stellar core config'"
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
            <b-modal lazy size="lg" id="tomlExportModal"
                     title="Stellar Core Config" ok-only ok-title="Close"
            >
                <pre><code>{{tomlNodesExport}}</code></pre>
            </b-modal>
        </template>
    </side-bar>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import OrganizationValidatorsDropdown
        from '@/components/organization/sidebar/organization-validators-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/node/tools/simulation/simulate-new-node.vue';
    import SideBar from '@/components/side-bar/side-bar.vue';
    import {BModal, VBModal, BBadge, VBTooltip} from 'bootstrap-vue';
    import TrustedOrganizationsDropdown from '@/components/organization/sidebar/trusted-organizations-dropdown.vue';

    @Component({
        components: {
            TrustedOrganizationsDropdown,
            SideBar,
            SimulateNewNode,
            NavLink,
            OrganizationValidatorsDropdown,
            BModal: BModal,
            BBadge
        },
        directives: {'b-modal': VBModal, 'b-tooltip': VBTooltip}
    })
    export default class OrganizationSideBar extends Vue {

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedOrganization() {
            return this.store.selectedOrganization;
        }

        get validators() {
            return this.selectedOrganization!.validators.map(validator => this.network.getNodeByPublicKey(validator)!);
        }

        get organizationType() {
            return this.selectedOrganization!.isTierOneOrganization ? 'T1 Organization' : 'Organization';
        }

        get network() {
            return this.store.network;
        }

        get tomlNodesExport() {
            let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(this.network);
            return stellarCoreConfigurationGenerator.nodesToToml(this.validators);
        }

        get failAt() {
            let nrOfValidatingNodes = this.validators
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