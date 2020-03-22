<template>
    <div>
        <b-dropdown right size="sm" text="More" class="p-0 m-0" toggle-class="more-button btn-thin" no-caret>
            <template slot="button-content">
                <i class="fe fe-more-vertical"></i>
            </template>
            <b-dropdown-header id="dropdown-header-label">
                Simulation options
            </b-dropdown-header>
            <b-dropdown-item v-b-modal="'add-validators-modal-' + id">
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
        from '@/components/quorum-monitor-deprecated/quorum-set-explorer/add-validators-table.vue';
    import Store from '@/store/Store';

    @Component({
        components: {AddValidatorsTable}
    })
    export default class QuorumSetActions extends Vue {
        @Prop()
        public quorumSet!: QuorumSet;
        @Prop()
        public level!:number;

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

        public deleteQuorumSetFromInnerQuorumSet(quorumSet: QuorumSet, fromQuorumSet?: QuorumSet) {
            if (fromQuorumSet === undefined) {
                fromQuorumSet = this.quorumSet;
            }

            this.$emit('delete-quorum-set', quorumSet, fromQuorumSet);
        }

        public deleteQuorumSet() {
            this.$emit('delete-quorum-set', this.quorumSet);
        }

        public get possibleValidatorsToAdd() {
            return this.store.network.nodes.filter((node: Node) =>
                node.isValidator
                && QuorumSet.getAllValidators(this.store.selectedNode!.quorumSet).indexOf(node.publicKey!) < 0);
        }

        public addQuorumSetToInnerQuorumSet(toQuorumSet: QuorumSet) {
            if (toQuorumSet === undefined) {
                toQuorumSet = this.quorumSet;
            }

            this.$emit('add-quorum-set', toQuorumSet);
        }

        public addValidatorsToQuorumSet(toQuorumSet: QuorumSet, validators: string[]) {
            this.$emit('add-validators', toQuorumSet, validators);
        }

        public addQuorumSet() {
            this.$emit('add-quorum-set', this.quorumSet);
        }

        public enableThresholdEditMode() {
            this.editingThreshold = true;
            this.$nextTick(() => {
                (this.$refs['editThresholdInput' + this.id] as HTMLInputElement).focus();
            });
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
            this.$emit('quorumset-edit-threshold', quorumSet, newThreshold);
        }

        public saveThresholdFromInput() {
            if (this.newThreshold <= 0) {
                this.inputState = false;
                return;
            }

            this.inputState = null;
            this.editingThreshold = false;
            (this.$refs.dropdown as any).hide(true);
            this.$emit('quorumset-edit-threshold', this.quorumSet, this.newThreshold);
        }

        onValidatorsSelected(validators: Node[]) {
            this.validatorsToAdd = validators.map((validator: Node) => validator.publicKey!);
        }

        validatorsToAddModalOk(bvEvent: any, modalId: string) {
            console.log(this.id);
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

    .btn-group-xs > .btn, .btn-xs {
        padding: .25rem .25rem;
        font-size: .875rem;
        line-height: .5;
        border-radius: .2rem;
    }

    .btn-primary {
        background: #1997c6;
        border-color: #1997c6;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #1a85ad;
        border-color: #1a85ad;
    }

    .dropdown-header {
        padding: 0.5rem 1rem;
    }

    .hover-btn {
        position: absolute;
        right: 45px;
        border: none;
        outline: 0;
    }
</style>
