<template>
    <div>
        <span v-if="node.isFullValidator"
              class="badge sb-badge badge-success vertical"
              v-b-tooltip:hover.top="'Full Validator'">
            <b-icon-shield/>
        </span>
        {{node.displayName | truncate(26)}}
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import {BIconShield, VBTooltip} from 'bootstrap-vue';

    @Component({
        name: "FullValidatorTitle",
        components: {BIconShield},
        directives: {'b-tooltip': VBTooltip}
    })
    export default class FullValidatorTitle extends Vue {
        @Prop()
        protected node!: Node;
    }
</script>

<style scoped>
    .vertical {
        vertical-align: text-bottom;
    }
</style>