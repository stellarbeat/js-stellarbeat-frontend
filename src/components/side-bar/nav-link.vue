<template>
    <div v-on:click="$emit('click')"
         :class="classObject"
         v-on:mouseenter="hover=true"
         v-on:mouseleave="hover=false"
         class="d-flex justify-content-between"
    >
        <div class="w-100 d-flex flex-column align-items-stretch">
            <div class="w-100 d-flex align-items-center">
                <div class="sb-nav-link-icon">
                    <!--i :title="warnings" v-if="showWarnings" v-b-popover.hover.top
                       class="fe fe-alert-triangle sb-alert"/!-->
                    <i v-if="showDropdownToggle" class="fe fe-chevron-down" :class="chevronClass"></i>
                    <i :title="warnings" v-else-if="showIcon" class="fe" :class="icon"></i>
                </div>
                <div class="w-100 d-flex justify-content-between align-content-center">
                    <nav-title :title="title" class="w-100 pt-0 pb-0 m-height"/>
                    <transition name="fade">
                        <div v-show="hover" :class="dropdownClass">
                            <slot name="action-dropdown"/>
                        </div>
                    </transition>
                </div>
            </div>
            <div v-if="showSubTitle" class="text-muted sub-title">
                {{subTitle}}
            </div>
        </div>
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
        showSubTitle!: boolean;

        @Prop()
        subTitle!: string;

        @Prop({default: false})
        showDropdownToggle!: boolean;

        @Prop({default: false})
        dropDownShowing!: boolean;

        @Prop({default: false})
        isLinkInDropdown!: boolean;

        @Prop({default: false})
        showWarnings!: boolean;

        @Prop()
        warnings!: string;

        @Prop({default: false})
        showIcon!: boolean;

        @Prop({default: 'fe-globe'})
        icon!: string;

        hover: boolean = false;

        get chevronClass(): any {
            return {
                'fe-chevron-right': !this.dropDownShowing,
                'fe-chevron-down': this.dropDownShowing,
            };
        }

        get classObject(): any {
            return {
                'sb-nav-dropdown-toggle': false,
                'sb-nav-link': !this.isLinkInDropdown,
                'sb-nav-dropdown-link': this.isLinkInDropdown
            };
        }

        get dropdownClass(): any {
            return {
                'right-end': !this.showDropdownToggle,
                'right': this.showDropdownToggle
            };
        }
    }
</script>
<style scoped>
    .m-height {
        min-height: 24.4px;
    }
    .sub-title {
        margin-left: 20px;
        font-size: 12px;
    }

    .sb-alert {
        color: orange;
        position: relative;
        left: 0px;
        top: 0px;
    }

    .sb-nav-link {
        padding: 1px 4px 1px 4px;
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
        line-height: .99;
        margin-right: 5px;
        min-width: 10px;
        opacity: 0.6;
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
        transition: opacity 0.7s ease;
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
        padding: 1px 4px 1px 4px;
    }

    .sb-nav-dropdown-link:hover {
        background-color: #f8f9fa;
    }
</style>