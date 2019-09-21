<template>
    <div class="btn-group" role="group" aria-label="UndoRedo">
        <button type="button" class="btn btn-secondary btn-no-border"
                v-b-popover.hover.top="'Undo change'"
                v-on:click="undoUpdate" :disabled="!hasUndo">
            <i class="fe fe-rotate-ccw"></i>
        </button>
        <button type="button" class="btn btn-secondary btn-no-border"
                v-b-popover.hover.top="'Reset simulation'"
                v-on:click="resetUpdates" :disabled="!hasUndo">
            Reset
        </button>
        <button type="button" class="btn btn-secondary btn-no-border"
                v-b-popover.hover.top="'Redo change'"
                v-on:click="redoUpdate"
                :disabled="!hasRedo">
            <i class="fe fe-rotate-cw"></i>
        </button>
    </div>
</template>
<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    @Component({
        name: "UndoRedo"
    })
    export default class UndoRedo extends Vue {
        @Prop()
        redoUpdate!: {};
        @Prop()
        resetUpdates!: {};
        @Prop()
        undoUpdate!: {};
        @Prop()
        hasUndo!: boolean;
        @Prop()
        hasRedo!: boolean;
    }
</script>

<style scoped>
    .btn-no-border {
        border: none;
    }
</style>