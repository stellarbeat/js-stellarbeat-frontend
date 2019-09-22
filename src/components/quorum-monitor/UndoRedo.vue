<template>
    <div class="btn-group" role="group" aria-label="UndoRedo">
        <button type="button" class="btn btn-secondary btn-no-border"
                v-b-popover.hover.top="'Undo change'"
                v-on:click="onUndoUpdate" :disabled="!store.hasUndo">
            <i class="fe fe-rotate-ccw"></i>
        </button>
        <button type="button" class="btn btn-secondary btn-no-border"
                v-b-popover.hover.top="'Reset simulation'"
                v-on:click="onReset" :disabled="!store.hasUndo">
            Reset
        </button>
        <button type="button" class="btn btn-secondary btn-no-border"
                v-b-popover.hover.top="'Redo change'"
                v-on:click="onRedoUpdate"
                :disabled="!store.hasRedo">
            <i class="fe fe-rotate-cw"></i>
        </button>
    </div>
</template>
<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import Store from "@/Store";

    @Component({
        name: "UndoRedo"
    })
    export default class UndoRedo extends Vue {
        get store(): Store {
            return this.$root.$data.store;
        }

        protected onUndoUpdate() {
            this.store.undoUpdate();
            this.resetRouteIfNoSelectedNode();

        }

        protected onRedoUpdate() {
            this.store.redoUpdate();
        }

        protected onReset() {
            this.store.resetUpdates();
            this.resetRouteIfNoSelectedNode();
        }

        protected resetRouteIfNoSelectedNode() {
            if (this.store.quorumMonitorStore.selectedNode
                && !this.store.network.getNodeByPublicKey(
                    this.store.quorumMonitorStore.selectedNode.publicKey
                )) {
                this.$router.push(
                    {
                        name: "quorum-monitor",
                        query: {"no-scroll": "1"}

                    },
                );
            }
        }
    }
</script>

<style scoped>
    .btn-no-border {
        border: none;
    }
</style>