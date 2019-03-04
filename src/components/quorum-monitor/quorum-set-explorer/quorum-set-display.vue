<template>
    <li class="list-group-item p-0 pt-1">
        <div class="titleContainer d-flex">
            <div @click="toggle" class="quorum-set pt-1 d-flex" v-bind:class="quorumSetState">
                <i class="caret fe mr-1" v-bind:class="chevron"></i>
                <h5 class="quorumSetTitle">
                    Quorumset with threshold:
                </h5>
            </div>
            <h5 v-show="!editingThreshold" class="quorumSetTitle pt-1" v-bind:class="quorumSetState">&nbsp;{{quorumSet.threshold}}</h5>
            <b-form-input
                    :id='"editThresholdInput" + id'
                    :ref='"editThresholdInput" + id'
                    :state="inputState"
                    v-show="editingThreshold"
                    class="thresholdEdit m-0 py-0 mx-2 mb-2"
                    size="sm"
                    v-model="newThreshold"
                    type="number"
                    v-on:keyup.enter.native="saveThresholdFromInput"
            >

            </b-form-input>

            <b-dropdown right id="editDropdown" size="sm" text="Edit" class="p-0 edit-dropdown">
                <template slot="button-content">
                    <i class="fe fe-edit-2"></i>
                </template>
                <b-dropdown-item v-on:click="enableThresholdEditMode">Edit threshold</b-dropdown-item>
                <!--b-dropdown-item>Add validator</b-dropdown-item>
                <b-dropdown-item>Add inner quorumset</b-dropdown-item>
                <b-dropdown-item v-if="!root">Remove</b-dropdown-item!-->
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
                <NodeActionBar :node="getNode(validator)" :network="network"
                               v-on:node-toggle-active="toggleNodeActive"
                               v-on:node-show-modal="showModal"></NodeActionBar>
            </div>
            <quorum-set-display v-for="innerQuorumSet in quorumSet.innerQuorumSets" :key="innerQuorumSet.hashKey"
                                :network="network"
                                :quorumSet="innerQuorumSet"
                                :root="false"
                                v-on:node-toggle-active="toggleNodeActive"
                                v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                                v-on:node-show-modal="showModal">
            </quorum-set-display>
        </div>
    </li>
</template>

<script lang="ts">
    import NodeActionBar from "./node-action-bar.vue";

    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";

    import {Network, Node, QuorumSet} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "quorum-set-display",
        components: {
            NodeActionBar,
        },
    })
    export default class QuorumSetDisplay extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public quorumSet!: QuorumSet;
        @Prop()
        public root!: boolean;

        public open: boolean = this.root;
        public editingThreshold: boolean = false;
        public newThreshold: number = this.quorumSet.threshold;
        public id: number = Math.ceil(Math.random() * 1000);
        public inputState:boolean|null = null;

        @Watch('quorumSet')
        public onQuorumSetChanged(quorumSet:QuorumSet) {//todo should this be handled by routing (component destroy?)
            this.editingThreshold = false;
            this.newThreshold = quorumSet.threshold;
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

        public toggleNodeActive(node: Node) {
            this.$emit("node-toggle-active", node);
        }

        public enableThresholdEditMode() {
            this.editingThreshold = true;
            this.$nextTick(() => {
                (this.$refs["editThresholdInput" + this.id] as HTMLInputElement).focus();
            });
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold:number) {
            this.$emit('quorumset-edit-threshold', quorumSet, newThreshold);
        }

        public saveThresholdFromInput(event: KeyboardEvent) {
            let input = (event.target as HTMLInputElement);
            let newThreshold = Number(input.value);
            if(newThreshold <= 0) {
                this.inputState = false;
                return;
            }

            this.inputState = null;
            this.editingThreshold = false;
            this.$emit("quorumset-edit-threshold", this.quorumSet, newThreshold);
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
            const failing = this.network.isQuorumSetFailing(this.quorumSet);
            return {
                failing,
                active: !failing,
            };
        }
    }
</script>

<style scoped>
    .thresholdEdit {
        width: 45px;
    }

    .quorumSetTitle {

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
        color: red
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
    }

    .edit-dropdown {
        margin-left: auto;
    }
</style>