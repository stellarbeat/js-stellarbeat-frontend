<template>
    <side-bar :sticky-key="'stellar-public'" icon="house">
        <template v-slot:title>
          {{ store.getNetworkIdPretty() }}
        </template>
        <template v-slot:sub-title>
                Network
            <b-badge v-if="store.networkHasDangers()" variant="danger"
                     style="vertical-align: bottom" v-b-tooltip.hover.right="store.getNetworkDangers().description">{{store.getNetworkDangers().label}}
            </b-badge>
            <b-badge v-if="store.networkHasWarnings()" variant="warning"
                     style="vertical-align: bottom" v-b-tooltip.hover.right="store.getNetworkWarnings().description">{{store.getNetworkWarnings().label}}
            </b-badge>
        </template>
        <template v-slot:explore-list-items>
            <li v-if="networkTransitiveQuorumSetOrganizations.length > 0" class="sb-nav-item">
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
                        :title="'Stellar core config'"
                        v-b-modal.tomlExportModal
                        :show-icon="true"
                        icon="download"
                />
            </li>
            <b-modal lazy size="lg" id="tomlExportModal"
                     title="Stellar Core Config" ok-only ok-title="Close"
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
                        title="Network analysis"
                        :show-icon="true"
                        icon="gear"
                        v-on:click="store.isNetworkAnalysisVisible = true"
                />
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
    import SimulateNewNode from '@/components/node/tools/simulation/simulate-new-node.vue';
    import ValidatorsDropdown from '@/components/network/sidebar/validators-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import OrganizationsDropdown from '@/components/network/sidebar/organizations-dropdown.vue';
    import SideBar from '@/components/side-bar/side-bar.vue';

    import {BIconX, BModal, VBModal, BBadge, VBTooltip} from 'bootstrap-vue';

    @Component({
        components: {
            SideBar,
            OrganizationsDropdown,
            NavLink, SimulateNewNode, ValidatorsDropdown,
            BModal,
            BIconX: BIconX,
            BBadge
        },
        directives: {'b-modal': VBModal, 'b-tooltip': VBTooltip}
    })
    export default class NetworkSideBar extends Vue {
        protected validatorsExpanded: boolean = this.networkTransitiveQuorumSetOrganizations.length === 0;
        protected organizationsExpanded: boolean = true;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network() {
            return this.store.network;
        }

        //todo: move to domain
        get networkTransitiveQuorumSetNodes() {
            return Array.from(this.network.nodesTrustGraph.networkTransitiveQuorumSet)
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