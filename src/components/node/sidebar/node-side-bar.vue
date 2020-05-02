<template>
    <side-bar :sticky-key="selectedNode.publicKey" icon="bullseye" :hasExploreSection="selectedNode.isValidator">
        <template v-slot:title>
            {{getDisplayName(selectedNode)}}
        </template>
        <template v-slot:sub-title>
            {{nodeType}}
            <b-badge v-show="network.isNodeFailing(selectedNode)" variant="danger"
                     style="vertical-align: bottom">Failing
            </b-badge>
        </template>
        <template v-slot:explore-list-items>
            <li class="sb-nav-item" v-if="selectedNode.organizationId">
                <organization-validators-dropdown :organization="organization"
                                                  :expand="true"/>
            </li>
            <li class="sb-nav-item">
                <quorum-set-dropdown :quorum-set="selectedNode.quorumSet" v-if="selectedNode.isValidator"
                                     :expand="quorumSetExpanded"
                                     v-on:toggleExpand="quorumSetExpanded=!quorumSetExpanded"/>
            </li>
        </template>
        <template v-slot:tool-list-items>
            <li class="sb-nav-item" v-if="selectedNode.isValidator">
                <nav-link
                        :title="selectedNode.isValidating ? 'Stop validating' : 'Try validating'"
                        :show-icon="true"
                        :icon="selectedNode.isValidating ? 'lightning-fill' : 'lightning'"
                        v-on:click="store.toggleValidating(selectedNode)"
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
            <li class="sb-nav-item" v-if="selectedNode.isValidator">
                <nav-link
                        title="Halting analysis"
                        :show-icon="true"
                        icon="gear-wide"
                        v-on:click="store.showHaltingAnalysis(selectedNode)"
                />
            </li>
            <li class="sb-nav-item" v-if="selectedNode.isValidator">
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
        </template>
    </side-bar>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import QuorumSetDropdown from '@/components/node/sidebar/quorum-set-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import OrganizationsDropdown from '@/components/network/sidebar/organizations-dropdown.vue';
    import OrganizationValidatorsDropdown from '@/components/node/sidebar/organization-validators-dropdown.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import stickybits from 'stickybits';
    import SideBar from '@/components/side-bar/side-bar.vue';
    import {BBadge, BModal, VBModal} from 'bootstrap-vue';

    @Component({
        components: {
            SideBar,
            OrganizationValidatorsDropdown,
            OrganizationsDropdown,
            SimulateNewNode,
            NavLink,
            QuorumSetDropdown,
            BModal: BModal,
            BBadge: BBadge
        },
        directives: {
            'b-modal': VBModal
        }
    })
    export default class NodeSideBar extends Vue {
        public quorumSetExpanded: boolean = this.selectedNode!.organizationId === undefined;

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get organization() {
            if (this.selectedNode!.organizationId)
                return this.network.getOrganizationById(this.selectedNode!.organizationId);
            else return null;
        }

        get network() {
            return this.store.network;
        }

        get nodeType() {
            return this.selectedNode!.isValidator ? (this.selectedNode!.isFullValidator ? 'Full Validator' : 'Validator') : 'Watcher';
        }

        get tomlNodesExport() {
            let stellarCoreConfigurationGenerator = new StellarCoreConfigurationGenerator(this.network);
            return stellarCoreConfigurationGenerator.nodesToToml([this.selectedNode!]);
        }

        getDisplayName(node: Node) {
            if (node.name)
                return node.name;

            return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100);
        }
    }
</script>
<style scoped>
</style>