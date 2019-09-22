<template>
    <div class="card">
        <div class="card-body p-0">
            <div class="search-bar">
                <search></search>
                <undo-redo class="undo-redo ml-2"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component} from "vue-property-decorator";
    import UndoRedo from '@/components/quorum-monitor/UndoRedo.vue';
    import Search from '@/components/quorum-monitor/search.vue';

    @Component({
        name: "search-card",
        components: {Search, UndoRedo}
    })
    export default class SearchCard extends Vue
    {

    }
</script>
<style scoped>
    .search-bar {
        display: flex;
    }
</style>