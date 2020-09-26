<template>
    <side-bar :sticky-key="'stellar-public'" icon="house">
        <template v-slot:title>
            Stellar Public
        </template>
        <template v-slot:sub-title>
                Network
        </template>
        <template v-slot:explore-list-items>
            <li class="sb-nav-item">
                <organizations-dropdown :organizations="networkTransitiveQuorumSetOrganizations"
                                        :expand="organizationsExpanded"/>
            </li>
            <li class="sb-nav-item">
                <validators-dropdown :nodes="networkTransitiveQuorumSetNodes"
                                     :expand="validatorsExpanded"/>
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
            <b-modal lazy size="lg" id="tomlExportModal"
                     title="Stellar Core Configuration" ok-only ok-title="Close"
            >
                <pre><code>{{tomlNodesExport}}</code></pre>
            </b-modal>
            <li class="sb-nav-item">
                <nav-link
                        v-b-modal.simulate-node-modal
                        :title="'Simulate new node'"
                        :show-icon="true"
                        icon="plus"
                />
                <simulate-new-node/>
            </li>
            <li class="sb-nav-item">
                <nav-link
                        v-b-modal.network-analysis-modal
                        title="Network analysis"
                        :show-icon="true"
                        icon="gear"
                />
                <network-analysis/>
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
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import ValidatorsDropdown from '@/components/network/sidebar/validators-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import OrganizationsDropdown from '@/components/network/sidebar/organizations-dropdown.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import stickybits from 'stickybits';
    import Search from '@/components/search.vue';
    import SideBar from '@/components/side-bar/side-bar.vue';

    import {BIconX, BModal, VBModal} from 'bootstrap-vue';
    import NetworkAnalysis from '@/components/network/tools/network-analysis/network-analysis.vue';

    @Component({
        components: {
            NetworkAnalysis,
            SideBar,
            OrganizationsDropdown,
            NavLink, SimulateNewNode, ValidatorsDropdown,
            BModal,
            BIconX: BIconX
        },
        directives: {'b-modal': VBModal}
    })
    export default class NetworkSideBar extends Vue {
        protected validatorsExpanded: boolean = false;
        protected organizationsExpanded: boolean = true;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network() {
            return this.store.network;
        }

        //todo: move to domain
        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.graph.networkTransitiveQuorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey)!);
        }

        //todo: move to domain
        get networkTransitiveQuorumSetOrganizations() {
            return [...new Set(this.networkTransitiveQuorumSetNodes
                .filter(node => node && node.organizationId)
                .map(node => this.network.getOrganizationById(node!.organizationId!))
            )];
        }

        get tomlNodesExport() {
            let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(this.network);
            return stellarCoreConfigurationGenerator.nodesToToml(this.networkTransitiveQuorumSetNodes);
        }
    }
</script>
<style scoped>
    .overflow {
        overflow-y: auto;
        max-height: calc(100vh - 18rem);
    }
</style>