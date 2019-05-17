<template>
    <li class="list-group-item p-0">
        <div  class="titleContainer pt-1 pb-1 d-flex">
            <div @click="toggle" class="quorum-set d-flex pt-1 pb-2" v-bind:class="quorumSetState">
                    <i class="caret fe mr-1" v-bind:class="chevron"></i>
                    <h5 v-if="quorumSet.hasValidators()" class="quorumSetTitle m-0">
                        Quorumset with threshold {{quorumSet.threshold}}
                    </h5>
                <h5 v-else class="quorumSetTitle m-0">
                    Empty QuorumSet
                </h5>
            </div>
            <b-dropdown ref="dropdown" right id="editDropdown" size="sm" text="Edit" class="p-0 mr-1 edit-dropdown" toggle-class="more-button" no-caret>
                <template slot="button-content">
                    <i class="fe fe-more-vertical"></i>
                </template>
                <b-dropdown-header id="dropdown-header-label">
                    Simulation options
                </b-dropdown-header>
                <b-dropdown-item v-b-modal="validatorsToAddModalId">
                    <i class="dropdown-icon fe fe-plus-circle"></i>Add Validators
                </b-dropdown-item>
                <b-dropdown-item v-if="!(level === 3)" v-on:click="addQuorumSet">
                    <i class="dropdown-icon fe fe-plus-circle"></i>Add QuorumSet
                </b-dropdown-item>
                <b-dropdown-item v-if="!(level === 1)" v-on:click="deleteQuorumSet">
                    <i class="dropdown-icon fe fe-minus-circle"></i>Delete QuorumSet
                </b-dropdown-item>
                <b-dropdown-form inline>
                    <i class="dropdown-icon fe fe-edit-2"></i>
                    <b-form-group
                            label-size="sm"
                            label="Threshold: "
                            label-for="dropdown-edit-threshold"
                            @submit.stop.prevent>
                        <b-form-input
                                id="dropdown-edit-threshold"
                                :state="inputState"
                                class="thresholdEdit"
                                size="sm"
                                v-model="newThreshold"
                                type="number"
                        >
                        </b-form-input>
                    </b-form-group>
                    <b-button variant="primary" size="sm" @click="saveThresholdFromInput" class="mt-2">Save Threshold</b-button>
                </b-dropdown-form>
                <b-dropdown-divider v-if="root"></b-dropdown-divider>
                <b-dropdown-item v-if="root" v-b-modal.tomlConfigModal>
                    <i class="dropdown-icon fe fe-save"></i>Export Config
                </b-dropdown-item>
            </b-dropdown>
        </div>
        <div v-show="open" class="list-group list-group-flush nested-tree">
            <div v-for="validator in quorumSet.validators" class="list-group-item p-1 validator d-flex">
                <a href="#" class="validator-link"
                   v-on:click.prevent.stop="selectNode(validator)">
                    <div v-bind:class="nodeState(validator)">
                        {{validatorDisplayName(validator) | truncate(30)}}
                    </div>
                </a>
                <NodeActionBar :node="getNode(validator)" :network="network" :supportsDelete="true"
                               v-on:node-toggle-active="toggleNodeActive"
                               v-on:node-toggle-validating="toggleNodeValidating"
                               v-on:node-show-modal="showModal"
                               v-on:node-delete="deleteNodeFromQuorumSet"
                ></NodeActionBar>
            </div>
            <quorum-set-display
                    v-for="innerQuorumSet in quorumSet.innerQuorumSets"
                    :key="quorumSet.innerQuorumSets.indexOf(innerQuorumSet)"
                    :network="network"
                    :quorumSet="innerQuorumSet"
                    :root="false"
                    :level="level + 1"
                    :index="quorumSet.innerQuorumSets.indexOf(innerQuorumSet)"
                    :possibleValidatorsToAdd="possibleValidatorsToAdd"
                    :selectedNode="selectedNode"
                    v-on:node-toggle-active="toggleNodeActive"
                    v-on:node-toggle-validating="toggleNodeValidating"
                    v-on:delete-validator-from-quorum-set="deleteNodeFromInnerQuorumSet"
                    v-on:delete-quorum-set="deleteQuorumSetFromInnerQuorumSet"
                    v-on:add-quorum-set="addQuorumSetToInnerQuorumSet"
                    v-on:add-validators="addValidatorsToQuorumSet"
                    v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                    v-on:node-show-modal="showModal">
            </quorum-set-display>
        </div>
        <b-modal lazy size="lg" :id="validatorsToAddModalId"
                 title="Select validators to add"
                 ok-title="Add"
                 v-on:ok="validatorsToAddModalOk">
            <template slot="default" slot-scope="{ visible }">
                <AddValidatorsTable v-if="visible" :validators="possibleValidatorsToAdd"
                                    v-on:validators-selected="onValidatorsSelected"/>
            </template>
        </b-modal>
        <b-modal v-if="root"lazy size="lg" id="tomlConfigModal"
                 title="Toml Configuration" ok-only ok-title="Close"
        >
            <TomlConfigViewer :quorumSet="quorumSet" :network="network"></TomlConfigViewer>
        </b-modal>
    </li>
</template>

<script lang="ts">
    import NodeActionBar from "./node-action-bar.vue";
    import AddValidatorsTable from "./add-validators-table.vue";
    import TomlConfigViewer from "./toml-config-viewer.vue";

    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";

    import {Network, Node, QuorumSet} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "quorum-set-display",
        components: {
            NodeActionBar,
            AddValidatorsTable,
            TomlConfigViewer
        },
    })
    export default class QuorumSetDisplay extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public quorumSet!: QuorumSet;
        @Prop()
        public root!: boolean;
        @Prop()
        public level!: number;
        @Prop({default: 0})
        public index!: number;
        @Prop()
        public selectedNode!:Node;
        @Prop()
        public possibleValidatorsToAdd!: Node[];

        public open: boolean = false;
        public editingThreshold: boolean = false;
        public newThreshold: number = this.quorumSet.threshold;
        public id: number = Math.ceil(Math.random() * 1000);
        public inputState: boolean | null = null;
        public validatorsToAdd: string[] = [];

        @Watch("quorumSet")
        public onQuorumSetChanged(quorumSet: QuorumSet) {//todo should this be handled by routing (component destroy?)
            this.editingThreshold = false;
            this.newThreshold = quorumSet.threshold;
        }

        public get validatorsToAddModalId() {
            return this.level + "." + this.index;
        }

        public validatorDisplayName(validator: string) {
            if (this.network.getNodeByPublicKey(validator)) {
                return this.network.getNodeByPublicKey(validator).displayName;
            } else {
                return validator;
            }
        }

        public getNode(publicKey: string) {
            return this.network.getNodeByPublicKey(publicKey);
        }

        public toggle() {
            this.open = !this.open;
        }

        public nodeState(validator: string) {
            const node = this.network.getNodeByPublicKey(validator);
            return {
                inactive: !node.active,
                active: node.active,
                failing: this.network.isNodeFailing(node),
            };
        }

        public toggleNodeValidating(node: Node) {
            this.$emit("node-toggle-validating", node);
        }

        public toggleNodeActive(node: Node) {
            this.$emit("node-toggle-active", node);
        }

        public deleteNodeFromQuorumSet(node: Node) {
            this.$emit("delete-validator-from-quorum-set", node, this.quorumSet);
        }

        public deleteNodeFromInnerQuorumSet(node: Node, quorumSet: QuorumSet) {
            this.$emit("delete-validator-from-quorum-set", node, quorumSet);
        }

        public deleteQuorumSetFromInnerQuorumSet(quorumSet: QuorumSet, fromQuorumSet?: QuorumSet) {
            if (fromQuorumSet === undefined) {
                fromQuorumSet = this.quorumSet;
            }

            this.$emit("delete-quorum-set", quorumSet, fromQuorumSet);
        }

        public deleteQuorumSet() {
            this.$emit("delete-quorum-set", this.quorumSet);
        }

        public addQuorumSetToInnerQuorumSet(toQuorumSet: QuorumSet) {
            if (toQuorumSet === undefined) {
                toQuorumSet = this.quorumSet;
            }

            this.$emit("add-quorum-set", toQuorumSet);
        }

        public addValidatorsToQuorumSet(toQuorumSet: QuorumSet, validators: string[]) {
            this.$emit("add-validators", toQuorumSet, validators);
        }

        public addQuorumSet() {
            this.open = true;
            this.$emit("add-quorum-set", this.quorumSet);
        }

        public enableThresholdEditMode() {
            this.editingThreshold = true;
            this.$nextTick(() => {
                (this.$refs["editThresholdInput" + this.id] as HTMLInputElement).focus();
            });
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
            this.$emit("quorumset-edit-threshold", quorumSet, newThreshold);
        }

        public saveThresholdFromInput() {
            if (this.newThreshold <= 0) {
                this.inputState = false;
                return;
            }

            this.inputState = null;
            this.editingThreshold = false;
            (this.$refs.dropdown as any).hide(true);
            this.$emit("quorumset-edit-threshold", this.quorumSet, this.newThreshold);
        }

        public showModal(node: Node) {
            this.$emit("node-show-modal", node);
        }

        public selectNode(validator: string) {
            this.$router.push({
                name: "quorum-monitor-node",
                params: {publicKey: validator},
                query: {"center": "1", "no-scroll": "1"},
            });
        }

        get chevron() {
            return this.open ? "fe-chevron-down" : "fe-chevron-right";
        }

        get quorumSetState() {
            const failing = this.network.isQuorumSetFailing(this.selectedNode, this.quorumSet);
            return {
                failing,
                active: !failing,
            };
        }

        onValidatorsSelected(validators: Node[]) {
            this.validatorsToAdd = validators.map((validator: Node) => validator.publicKey);
        }

        validatorsToAddModalOk(bvEvent: any, modalId: string) {
            this.open = true;
            if (this.validatorsToAdd.length > 0) {
                this.addValidatorsToQuorumSet(
                    this.quorumSet,
                    this.validatorsToAdd
                );
            }
        }
    }
</script>

<style scoped>
    .thresholdEdit {
        margin-left: 10px;
        width: 45px !important;
    }

    .titleContainer:hover {
        background-color: #f8f9fa;
        cursor: pointer;
        width: 100%;
    }

    .active-node {
        color: #1997c6;
    }

    li {
        padding-left: 0px;
    }

    .caret {
        cursor: pointer;
    }

    .nested-tree {
        margin-left: 20px;
    }

    .inactive {
        color: #c3c2bb
    }

    .active {
        color: #1997c6
    }

    .failing {
        color: #cd201f
    }

    .list-group-item, .list-group-item:hover {
        z-index: auto;
    }

    .validator-link {
        width: 100%;
    }

    .validator {

    }

    a:hover, a:visited, a:link, a:active {
        text-decoration: none;
    }

    a:hover {
        background-color: #f8f9fa;
    }

    .quorum-set {
        cursor: pointer;
        width: 100%;
    }

    .edit-dropdown {
        margin-left: auto;
    }

    .dropdown-header {
        padding: 0.5rem 1rem;
    }
</style>