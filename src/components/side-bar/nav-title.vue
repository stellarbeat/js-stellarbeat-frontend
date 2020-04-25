<template>
    <div class="sb-nav-title" :class="classObject">
        {{title}}
        <b-icon-exclamation-triangle :title="danger" v-if="hasDanger" v-b-popover.hover.top class="sb-danger mr-1"/>
        <b-icon-exclamation-triangle :title="warnings" v-else-if="hasWarnings" v-b-popover.hover.top class="sb-alert mr-1"/>
    </div>
</template>
<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import {Prop} from 'vue-property-decorator';

    @Component({})
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
