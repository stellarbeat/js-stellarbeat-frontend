<template>
    <div v-on:click="$emit('click')"
         :class="classObject"
         v-on:mouseenter="hover=true"
         v-on:mouseleave="hover=false"
    >
        <div class="sb-nav-link-icon">
            <i title="Warning!" v-show="hasWarnings" v-b-popover.hover.top class="fe fe-alert-triangle sb-alert"/>
        </div>

        <nav-title :title="title" class="w-100"/>
        <transition name="fade" >
            <div v-show="hover" class="right">
                <slot name="action-dropdown"/>
            </div>
        </transition>
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
        showDropdownToggle!: boolean;

        @Prop({default: false})
        isLinkInDropdown!: boolean;

        hover: boolean = false;
        hasWarnings: boolean = false;

        get classObject(): any {
            return {
                'sb-nav-dropdown-toggle': this.showDropdownToggle,
                'sb-nav-link': !this.isLinkInDropdown,
                'sb-nav-dropdown-link': this.isLinkInDropdown
            };
        }
    }
</script>
<style scoped>
    .sb-alert {
        color: orange;
        opacity: 0.6;
        position: relative;
        left: 0px;
        top: 0px;
    }

    .sb-nav-link {
        padding: 4px;
        display: flex;
        align-items: center;
        cursor: pointer;
        color: rgba(0, 0, 0, .55);
        font-weight: 600;
        outline: 0;

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
        margin-bottom: 0px;
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

    .fade-enter-active, .fade-leave-active {
        transition: opacity 1s ease;
    }

    .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
    {
        opacity: 0;
    }

    .sb-nav-dropdown-link {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: rgba(0, 0, 0, .55);
        width: 100%;
        font-weight: 400;
        font-size: 90%;
        padding: 4px;
        min-height: 32.4px;
    }

    .sb-nav-dropdown-link:hover {
        background-color: #f8f9fa;
    }

    .sb-nav-link-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        display: block;
        margin-right: .5rem;
        line-height: .99;
        min-width: 15px;
    }

    .right {
        position: absolute;
        right: 25px;
    }
</style>