<template>
    <div v-on:click="$emit('click')"
         v-on:keyup.enter="$emit('click')"
         v-on:keyup.space="$emit('click')"
         :class="classObject"
         v-on:mouseenter="hover=true"
         v-on:mouseleave="hover=false"
         role="button"
         tabindex="0"
         class="d-flex justify-content-between"
    >
        <div class="w-100 d-flex flex-row justify-content-between align-items-center">
            <div class="w-100 d-flex flex-column align-items-stretch">
                <div class="w-100 d-flex align-items-center align-content-center">
                    <div class="sb-nav-link-icon align-content-center">
                        <b-icon :icon="chevronDirection" scale="0.8" v-if="showDropdownToggle"/>
                        <b-icon v-else-if="showIcon" :icon="icon" scale="0.8"/>
                    </div>

                    <div class="w-100 d-flex justify-content-between align-content-center">
                        <nav-title
                            :title="title" :classes="'w-100 pb-0 m-height ' + (secondary ? 'secondary':'')"
                            :has-warnings="hasWarnings"
                            :warnings="warnings"
                            :has-danger="hasDanger"
                            :danger="dangers"
                        />
                    </div>
                </div>
                <div v-if="showSubTitle" class="text-muted sub-title">
                    {{subTitle}}
                </div>
            </div>
            <div class="action mr-1">
                <transition name="fade">
                    <div :class="dropdownClass" v-if="hover">
                        <slot name="action-dropdown"/>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';
import NavTitle from '@/components/side-bar/nav-title.vue';
import {
    BIcon,
    BIconPlus,
    BIconDownload,
    BIconChevronRight,
    BIconChevronDown,
    BIconLightning,
    BIconLightningFill,
    BIconGearWide,
    BIconGear,
    BIconSearch,
    BBadge
} from 'bootstrap-vue';

@Component({
    components: {
        NavTitle, BIcon, BIconPlus, BIconDownload, BIconChevronRight, BIconChevronDown, BIconLightning, BIconGear, BIconSearch,
        BIconLightningFill,
        BIconGearWide, BBadge
    }
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
    hasWarnings!: boolean;

    @Prop()
    warnings!: string;

    @Prop({default: false})
    hasDanger!: boolean;

    @Prop()
    dangers!: string;

    @Prop({default: false})
    showIcon!: boolean;

    @Prop({})
    icon!: string;

    @Prop({default: false})
    secondary!: boolean;

    hover: boolean = false;

    get titleClass(): any {
        return {
            'secondary': this.secondary
        };
    }

    get chevronDirection(): any {
        if (this.dropDownShowing)
            return 'chevron-down';
        else return 'chevron-right';
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
.action {
    min-width: 20px;
}

.sub-title {
    margin-left: 20px;
    font-size: 12px;
    margin-top: -5px;
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