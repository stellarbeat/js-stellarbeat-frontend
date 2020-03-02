<template>
    <div class="sb-nav-link" v-on:click="$emit('click')" :class="classObject">
        <!--div class="sb-nav-link-icon">
            <i class="fe fe-target"/>
        </div!-->
        <nav-title :title="title"/>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import NavTitle from '@/components/side-bar/nav-title.vue';

    @Component({
        components: {NavTitle}
    })
    export default class NavLink extends Vue {
        @Prop()
        title!: string;

        @Prop({default: false})
        dropdownToggle!: boolean;

        get classObject(): any {
            return {
                'sb-nav-dropdown-toggle': this.dropdownToggle
            };
        }
    }
</script>
<style scoped>
    .sb-nav-link {
        padding: 4px;
        display: flex;
        align-items: center;
        cursor: pointer;
        color: rgba(0, 0, 0, .55);
        font-weight: 600;
    }

    .sb-nav-link:hover {
        background-color: #f8f9fa;
    }

    .sb-nav-link-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        display: block;
        margin-right: .5rem;
        line-height: .99;
    }

    .sb-nav-dropdown-toggle {
        margin-bottom: 4px;
    }

    .sb-nav-dropdown-toggle::after {
        content: "";
        display: inline-block;
        vertical-align: .272em;
        width: .32em;
        height: .32em;
        border-bottom: 1px solid;
        border-bottom-color: currentcolor;
        border-bottom-style: solid;
        border-bottom-width: 1px;
        border-left: 1px solid;
        border-left-color: currentcolor;
        border-left-style: solid;
        border-left-width: 1px;
        transform: rotate(-45deg);
        margin-left: auto;
        margin-right: 5px;
    }
</style>