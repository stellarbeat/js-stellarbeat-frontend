<template>
    <div>
        <b-dropdown ref="dropdown" v-on:click.prevent.stop="'#'" right text="More" class="p-0 m-0" toggle-class="more-button btn-thin" no-caret>
            <template slot="button-content">
                <b-icon-three-dots-vertical scale="0.9"/>
            </template>
            <b-dropdown-header id="dropdown-header-label" v-on:click.prevent.stop="'#'">
                Simulation options
            </b-dropdown-header>
            <b-dropdown-item v-b-modal="'add-validators-modal-' + id" v-on:click.prevent.stop>
                <b-icon-plus-circle class="dropdown-icon" scale="0.9"/>Add Validators
            </b-dropdown-item>
            <b-dropdown-item v-if="!(level === 2)" v-on:click.prevent.stop="addQuorumSet">
                <b-icon-plus-circle class="dropdown-icon" scale="0.9"/>Add QuorumSet
            </b-dropdown-item>
            <b-dropdown-item v-if="!(level === 0)" v-on:click.prevent.stop="deleteQuorumSet">
                <b-icon-x-circle class="dropdown-icon" scale="0.9"/>Delete QuorumSet
            </b-dropdown-item>
            <b-dropdown-form form-class="inline" inline v-on:click.prevent.stop="'#'">
                <b-icon-pencil class="dropdown-icon" scale="0.9"/>
                <b-form-group
                        label-size="sm"
                        label="Threshold"
                        label-for="dropdown-edit-threshold"
                        @submit.stop.prevent
                v-on:click.prevent.stop>
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
                <b-button variant="primary" size="sm" @click="saveThresholdFromInput" class="mt-2">Save Threshold
                </b-button>
            </b-dropdown-form>
        </b-dropdown>
        <b-modal lazy size="lg" :id="'add-validators-modal-' + id"
                 title="Select validators to add"
                 ok-title="Add"
                 v-on:ok="validatorsToAddModalOk">
            <template slot="default" slot-scope="{ visible }">
                <AddValidatorsTable v-if="visible" :validators="possibleValidatorsToAdd"
                                    v-on:validators-selected="onValidatorsSelected"/>
            </template>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';

    import {Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import AddValidatorsTable
        from '@/components/node/simulation/add-validators-table.vue';
    import Store from '@/store/Store';

    @Component({
        components: {AddValidatorsTable}
    })
    export default class QuorumSetActions extends Vue {
        @Prop()
        public quorumSet!: QuorumSet;
        @Prop({default:null})
        public parentQuorumSet!:QuorumSet;
        @Prop()
        public level!: number;

        public editingThreshold: boolean = false;
        public newThreshold: number = this.quorumSet.threshold;
        public id: number = Math.ceil(Math.random() * 1000);
        public validatorsToAdd: string[] = [];
        public inputState: boolean | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        public deleteQuorumSet() {
            this.store.deleteInnerQuorumSet(this.quorumSet, this.parentQuorumSet);
        }

        public get possibleValidatorsToAdd() {
            return this.store.network.nodes.filter((node: Node) =>
                node.isValidator
                && QuorumSet.getAllValidators(this.store.selectedNode!.quorumSet).indexOf(node.publicKey!) < 0);
        }

        public addValidatorsToQuorumSet(toQuorumSet: QuorumSet, validators: string[]) {
            this.store.addValidators(toQuorumSet, validators);
        }

        public addQuorumSet() {
            this.store.addInnerQuorumSet(this.quorumSet);
        }

        public enableThresholdEditMode() {
            this.editingThreshold = true;
            this.$nextTick(() => {
                (this.$refs['editThresholdInput' + this.id] as HTMLInputElement).focus();
            });
        }

        public saveThresholdFromInput() {
            if (this.newThreshold <= 0) {
                this.inputState = false;
                return;
            }

            this.inputState = null;
            this.editingThreshold = false;
            (this.$refs.dropdown as any).hide(true);
            this.store.editQuorumSetThreshold(this.quorumSet, this.newThreshold);
        }

        onValidatorsSelected(validators: Node[]) {
            this.validatorsToAdd = validators.map((validator: Node) => validator.publicKey!);
        }

        validatorsToAddModalOk(bvEvent: any, modalId: string) {
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
    .inline {
        display: flex!important;
    }
    .thresholdEdit {
        margin-left: 10px;
        width: 45px !important;
    }
</style>
