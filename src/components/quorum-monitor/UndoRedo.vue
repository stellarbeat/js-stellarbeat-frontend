<template>
    <div class="btn-group" role="group" aria-label="UndoRedo">
        <button type="button" class="btn btn-secondary btn-sm"
                v-on:click="undoUpdate" :disabled="!hasUndo">
            <i class="fe fe-rotate-ccw"></i>
        </button>
        <button type="button" class="btn btn-secondary btn-sm"
                v-on:click="resetUpdates" :disabled="!hasUndo">
            Reset changes
        </button>
        <button type="button" class="btn btn-secondary btn-sm" v-on:click="redoUpdate"
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
