<template>
    <div class="sb-nav-title" :class="classObject">
        {{title}}
        <i :title="danger" v-if="hasDanger" v-b-popover.hover.top
           class="fe fe-alert-triangle sb-danger mr-1"/>
        <i :title="warnings" v-else-if="hasWarnings" v-b-popover.hover.top
           class="fe fe-alert-triangle sb-alert mr-1"/>
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

    }

    .sb-danger {
        color: #cd201f;
    }

    .sb-alert {
        color: #fec601;
    }
</style>
