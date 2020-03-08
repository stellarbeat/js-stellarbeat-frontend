<template>
    <div class="sb-nav-title">
        <slot>{{title | truncate(20)}}</slot>
    </div>
</template>
<script lang="ts">
    export default {
        name: 'nav-title',
        props: {
            title: {}
        }
    };
</script>

<style scoped>
    .sb-nav-title {
        word-wrap: break-word;
    }
</style>
