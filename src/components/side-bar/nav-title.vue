<template>
    <div class="sb-nav-title">
        {{title}}
        <i title="warnings" v-if="hasWarnings" v-b-popover.hover.top
           class="fe fe-alert-triangle sb-alert mr-1"/><!-- add through slot! !-->
    </div>
</template>
<script lang="ts">
    export default {
        name: 'nav-title',
        props: {
            title: {},
            hasWarnings: {}
        }
    };
</script>

<style scoped>
    .sb-nav-title {
    }
    .sb-alert {
        color: orange;
        position: relative;
        left: 0px;
        top: 0px;
    }
</style>
