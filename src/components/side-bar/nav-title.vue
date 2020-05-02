<template>
    <div class="sb-nav-title" :class="classObject">
        {{title}}
        <b-icon-exclamation-triangle :title="danger" v-if="hasDanger" v-b-tooltip:hover.top="{ variant: 'danger' }" class="sb-danger mr-1"/>
        <b-icon-exclamation-triangle :title="warnings" v-else-if="hasWarnings" v-b-tooltip:hover.top="{ variant: 'warning' }" class="sb-alert mr-1"/>
    </div>
</template>
<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import {Prop} from 'vue-property-decorator';
    import {BIcon, BIconExclamationTriangle, VBTooltip} from 'bootstrap-vue';

    @Component({
        components: {BIcon, BIconExclamationTriangle},
        directives: {'b-tooltip': VBTooltip}
    })
    export default class NavTitle extends Vue {
        @Prop()
        title!:string;
        @Prop({default: false})
        hasWarnings!:boolean;
        @Prop()
        warnings!:string;
        @Prop({default: false})
        hasDanger!:boolean;
        @Prop()
        danger!:string;

        get classObject(){
            return {
                'sb-danger': this.hasDanger
            }
        }
    };
</script>

<style scoped>
    .sb-nav-title {
        padding-top: 2px;
    }

    .sb-danger {
        color: #cd201f;
    }

    .sb-alert {
        color: #fec601;
    }
</style>
