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
        <div class="card-body p-3 quorum-set-explorer-card-body">
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
            <simulate-new-node class="col-12 pl-0"></simulate-new-node>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from "@/Store";
    import {Node, PublicKey, QuorumSet} from "@stellarbeat/js-stellar-domain";
    import SimulateNewNode from '@/components/quorum-monitor/quorum-set-explorer/simulate-new-node.vue';

    @Component({
        name: "quorum-set-explorer-card",
        components: {SimulateNewNode, FullValidatorTitle}
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
    }
</script>
<style scoped>
.quorum-set-explorer-card-body{
    min-height: 364px;
    max-height: 364px;
    overflow-y: auto;
}
</style>