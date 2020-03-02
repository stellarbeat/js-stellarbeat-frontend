<template>
    <div class="sb-nav-dropdown-link" v-on:click="$emit('click')">
        <!--div class="sb-nav-link-icon">
            <i class="fe fe-target"/>
        </div!-->
        <nav-title :title="title"/>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import NavTitle from '@/components/side-bar/nav-title.vue';

    @Component({
        components: {NavTitle}
    })
    export default class NavLink extends Vue {
        @Prop()
        title!: string;
    }
</script>
<style scoped>
    .sb-nav-dropdown-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: rgba(0, 0, 0, .55);
        width: 100%;
        font-weight: 400;
        font-size: 90%;
        padding: 4px;
    }

    .sb-nav-dropdown-link:hover {
        background-color: #f8f9fa;
    }
</style>