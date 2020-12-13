<template functional>
    <div class="sb-nav-title" :class="(props.hasDanger ? 'sb-danger ': '') + props.classes">
        {{props.title}}
        <b-icon-exclamation-triangle :title="props.danger" v-if="props.hasDanger" v-b-tooltip:hover.top="{ variant: 'danger' }" class="sb-danger mr-1"/>
        <b-icon-exclamation-triangle :title="props.warnings" v-else-if="props.hasWarnings" v-b-tooltip:hover.top="{ variant: 'warning' }" class="sb-alert mr-1"/>
    </div>
</template>
<script lang="ts">
    import {BIconExclamationTriangle, VBTooltip} from 'bootstrap-vue';
    import Vue from "vue";
    Vue.component("b-icon-exclamation-triangle", BIconExclamationTriangle);
    Vue.directive("b-tooltip", VBTooltip);
    export default{
        props: {
            title: {
                type: String,
                default: ''
            },
            hasWarnings: {
                type: Boolean,
                default: false
            },
            warnings: {
                type: String,
                default: ''
            },
            hasDanger: {
                type: Boolean,
                default: false
            },
            danger: {
                type: String,
                default: ''
            },
            classes: {
                type: String,
                default: ''
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

    .secondary {
        font-size: 14px;
    }

    .m-height {
        min-height: 26px;
    }
</style>
