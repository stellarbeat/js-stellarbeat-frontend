<template>
    <div>
        <transition
                name="fade"
                mode="out-in"
        >
            <div class="card pt-0 h-100">
                <div id="sticky">
                    <div :key="selectedOrganization.id">
                        <div class="card-header sb-card-header inverted d-flex align-items-start">
                            <h3 class="title-icon">
                                <b-icon-building scale="0.8"
                                                 class="bg-success rounded mr-1" variant="light"/>
                            </h3>
                            <!--TODO: failing org color!-->
                            <div class="d-flex flex-column">
                                <h3 class="card-title sb-card-title">
                                    {{selectedOrganization.name}}
                                </h3>

                                <h6 class="sb-card-subtitle">Organization</h6>
                            </div>
                        </div>
                        <div class="card-body px-4 pt-1">
                            <div class="sb-nav-bar">
                                <h6 class="sb-navbar-heading">Explore</h6>
                                <ul v-if="!store.isLoading" class="sb-nav-list">
                                    <li class="sb-nav-item">
                                        <organization-validators-dropdown :organization="selectedOrganization"
                                                                          :expand="true"/>
                                    </li>
                                </ul>
                                <h6 class="sb-navbar-heading mt-4">Tools</h6>
                                <ul class="sb-nav-list">
                                    <li class="sb-nav-item">
                                        <nav-link
                                                :title="'Export configuration'"
                                                v-b-modal.tomlExportModal
                                                :show-icon="true"
                                                icon="fe-save"
                                        />
                                    </li>
                                    <li class="sb-nav-item">
                                        <nav-link
                                                v-b-modal.simulate-node-modal
                                                :title="'Simulate new node'"
                                                :show-icon="true"
                                                icon="fe-plus-circle"
                                        />
                                        <simulate-new-node/>
                                    </li>
                                </ul>

                                <h6 class="sb-navbar-heading mt-3">Options</h6>
                                <ul class="sb-nav-list">
                                    <li class="sb-nav-item">
                                        <b-form-checkbox v-model="store.includeWatcherNodes"
                                                         name="include-watcher-nodes-button"
                                                         class="sb-nav-item sb-nav-toggle"
                                                         switch>
                                            Watcher nodes
                                        </b-form-checkbox>
                                    </li>
                                </ul>
                                <undo-redo v-if="store.isSimulation || store.hasRedo"/>
                                <b-modal lazy size="lg" id="tomlExportModal"
                                         title="Stellar Core Configuration" ok-only ok-title="Close"
                                >
                                    <pre><code>{{tomlNodesExport}}</code></pre>
                                </b-modal>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';
    import OrganizationValidatorsDropdown
        from '@/components/side-bar/organization/organization-validators-dropdown.vue';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import SimulateNewNode from '@/components/node/simulation/simulate-new-node.vue';
    import ShieldCheck from '@/components/svg/shield-check.vue';
    import UndoRedo from '@/components/node/simulation/UndoRedo.vue';
    import stickybits from 'stickybits';

    @Component({
        components: {
            UndoRedo,
            ShieldCheck,
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

        get network() {
            return this.store.network;
        }

        get tomlNodesExport() {
            return '';
        }

        mounted() {
            stickybits('#sticky');
        }
    }
</script>
<style scoped>
    .sb-bg-primary {
        background-color: #1997c6;
    }
</style>