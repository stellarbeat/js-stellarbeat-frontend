<template>
    <div class="btn-group undo-redo" role="group" aria-label="UndoRedo">
        <div v-b-popover.hover.bottomright="'Undo change'">
            <button type="button" class="btn btn-secondary btn-icon"
                    v-on:click="onUndoUpdate" :disabled="!store.hasUndo">
                <i class="fe fe-rotate-ccw"></i>
            </button>
        </div>
        <button type="button" class="btn btn-secondary"
                v-on:click="onReset" :disabled="!store.hasUndo">
            Reset simulation
        </button>
        <div v-b-popover.hover.bottomleft="'Redo change'"
        >
            <button type="button" class="btn btn-secondary btn-icon"
                    v-on:click="onRedoUpdate"
                    :disabled="!store.hasRedo">
                <i class="fe fe-rotate-cw"></i>
            </button>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import Store from '@/store/Store';

    @Component({
        name: 'UndoRedo'
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
            if (this.store.selectedNode
                && !this.store.network.getNodeByPublicKey(
                    this.store.selectedNode.publicKey!
                )) {
                this.$router.push(
                    {
                        name: 'network-dashboard',
                        query: {'no-scroll': '1'}

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
    .undo-redo {
        opacity: 0.75;
    }
</style>