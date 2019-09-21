<template>
    <div>
        <span v-if="node.isFullValidator"
              class="badge sb-badge badge-success full-validator-badge"
              v-b-popover.hover.top="'Full Validator'">
            <i class="fe fe-shield"></i>
        </span>
        {{node.displayName | truncate(26)}}
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    @Component({
        name: "FullValidatorTitle"
    })
    export default class FullValidatorTitle extends Vue {
        @Prop()
        protected node!: Node;
    }
</script>

<style scoped>

</style>