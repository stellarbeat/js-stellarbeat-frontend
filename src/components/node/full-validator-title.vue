<template>
    <div>
        <span v-if="node.isFullValidator"
              class="badge sb-badge badge-success full-validator-badge"
              v-b-popover.hover.top="'Full Validator'">
            <b-icon-shield/>
        </span>
        {{node.displayName | truncate(26)}}
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import {VBPopover, BIconShield} from 'bootstrap-vue';

    @Component({
        name: "FullValidatorTitle",
        components: {BIconShield},
        directives: {'b-popover': VBPopover}
    })
    export default class FullValidatorTitle extends Vue {
        @Prop()
        protected node!: Node;
    }
</script>

<style scoped>

</style>