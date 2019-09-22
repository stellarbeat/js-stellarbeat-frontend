<template>
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">
                <full-validator-title :node="selectedNode"/>
            </h3>
        </div>
        <div v-if="$root.$data.store.network.isNodeFailing($root.$data.store.quorumMonitorStore.selectedNode)" class="card-alert alert alert-danger mb-0">
            <i class="fe fe-alert-triangle"></i>
            Node not validating {{network.isQuorumSetFailing(selectedNode, selectedNode.quorumSet) ? ": quorumset not reaching threshold" : ""}}
        </div>
        <div class="card-body p-3">
            <div class="row">
                <div class="col-12">
                    <router-view v-on:node-toggle-active="toggleActive"
                                 v-on:node-toggle-validating="toggleValidating"
                                 v-on:quorumset-edit-threshold="editQuorumSetThreshold"
                                 v-on:quorumset-delete-validator="deleteValidatorFromQuorumSet"
                                 v-on:quorumset-delete-inner-quorumset="deleteInnerQuorumSet"
                                 v-on:quorumset-add-inner-quorumset="addInnerQuorumSet"
                                 v-on:quorumset-add-validators="addValidators"
                                 v-on:show-halting-analysis="$emit('show-halting-analysis', selectedNode.publicKey)"
                                 :network="network"
                                 :selectedNode="selectedNode"
                    >
                    </router-view>
                </div>
            </div>

        </div>
        <div class="card-footer p-3">
            <div class="col-12 pl-0">
                <b-button v-b-modal.simulate-node-modal size="sm" variant="primary">
                    <i class="fe fe-plus-circle"></i>
                    Simulate a new node
                </b-button>
                <b-modal
                        ok-title="Simulate Node" size="lg" id="simulate-node-modal"
                        title="Simulate a new node"
                        v-on:ok="simulateNewNode"
                >
                    <b-form-input v-model="newNodeName"
                                  placeholder="Enter a name"></b-form-input>
                </b-modal>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from "@/Store";
    import {Node, PublicKey, QuorumSet} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "quorum-set-explorer-card",
        components: {FullValidatorTitle}
    })
    export default class QuorumSetExplorerCard extends Vue
    {
        protected newNodeName: string = "";

        get store():Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get centerNode() {
            return this.store.quorumMonitorStore.centerNode;
        }

        get network() {
            return this.$root.$data.store.network;
        }

        public toggleActive(node: Node) {
            this.store.toggleActive(node);
        }

        public toggleValidating(node: Node) {
            this.store.toggleValidating(node);
        }

        public updateValidatingStates(updates: Array<{ "publicKey": PublicKey, "validating": boolean }>) {
            this.store.updateValidatingStates(updates);
        }

        public editQuorumSetThreshold(quorumSet: QuorumSet, newThreshold: number) {
            this.store.editQuorumSetThreshold(quorumSet, newThreshold);
        }

        public deleteValidatorFromQuorumSet(quorumSet: QuorumSet, validator: Node) {
            this.store.deleteValidatorFromQuorumSet(quorumSet, validator);
        }

        public deleteInnerQuorumSet(quorumSet: QuorumSet, fromQuorumSet: QuorumSet) {
            this.store.deleteInnerQuorumSet(quorumSet, fromQuorumSet);
        }

        public addInnerQuorumSet(toQuorumSet: QuorumSet) {
            this.store.addInnerQuorumSet(toQuorumSet);
        }

        public addValidators(toQuorumSet: QuorumSet, validators: string[]) {
            this.store.addValidators(toQuorumSet, validators);
        }

        public simulateNewNode() {
            let node = new Node("localhost");
            node.name = this.newNodeName === "" ? "MyNewNode" : this.newNodeName;
            node.publicKey = this.makePublicKey();
            node.quorumSet.threshold = 1;
            node.active = true;
            node.isValidating = true;
            node.isValidator = true;
            this.$set(node, "x", 0); //doesn't belong here, needs better solution
            this.$set(node, "y", 0);
            this.store.addNodeToNetwork(node);
            this.$router.push(
                {
                    name: "quorum-monitor-node",
                    params: {publicKey: node.publicKey},
                    query: {"center": "1", "no-scroll": "1"},
                },
            );
        }

        protected makePublicKey() {
            let result = "G";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let charactersLength = characters.length;
            for (let i = 0; i < 56; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }
    }
</script>
<style scoped>

</style>