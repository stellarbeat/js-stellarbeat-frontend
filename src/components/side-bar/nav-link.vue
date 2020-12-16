<template functional>
    <div v-on:click="listeners.click()"
         :class="{
                'sb-nav-dropdown-toggle': false,
                'sb-nav-link': props.isLinkInDropdown,
                'sb-nav-dropdown-link': props.isLinkInDropdown
            }"
         role="button"
         tabindex="0"
         class="d-flex justify-content-between trigger"
    >
        <div class="w-100 d-flex flex-row justify-content-between align-items-center trigger">
            <div class="w-100 d-flex flex-column align-items-stretch trigger">
                <div class="w-100 d-flex align-items-center align-content-center">
                    <div class="sb-nav-link-icon align-content-center">
                        <b-icon :icon="$options.methods.chevronDirection(props.dropDownShowing)" scale="0.8"
                                v-if="props.showDropdownToggle"/>
                        <b-icon v-else-if="props.showIcon" :icon="props.icon" scale="0.8"/>
                    </div>

                    <div class="w-100 d-flex justify-content-between align-content-center">
                        <nav-title
                            :title="props.title" :classes="'w-100 pb-0 m-height ' + (props.secondary ? 'secondary':'')"
                            :has-warnings="props.hasWarnings"
                            :warnings="props.warnings"
                            :has-danger="props.hasDanger"
                            :danger="props.dangers"
                        />
                    </div>
                </div>
                <div v-if="props.showSubTitle" class="text-muted sub-title">
                    {{ props.subTitle }}
                </div>
            </div>
            <div class="action mr-1">
                <transition name="fade">

                <div :class="$options.methods.dropdownClass(props.showDropdownToggle)" class="my-hidden">
                        <slot name="action-dropdown"/>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
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

Vue.component('nav-title', NavTitle);
Vue.component('b-icon', BIcon);
Vue.component('b-icon-plus', BIconPlus);
Vue.component('b-icon-download', BIconDownload);
Vue.component('b-icon-chevron-right', BIconChevronRight);
Vue.component('b-icon-chevron-down', BIconChevronDown);
Vue.component('b-icon-lightning', BIconLightning);
Vue.component('b-icon-gear', BIconGear);
Vue.component('b-icon-search', BIconSearch);
Vue.component('b-icon-lightning-fill', BIconLightningFill);
Vue.component('b-icon-gear-wide', BIconGearWide);
Vue.component('b-badge', BBadge);

export default {
    props: {
        title: {
            type: String,
            default: ''
        },
        showSubTitle: {
            type: Boolean,
            default: false
        },
        subTitle: {
            type: String,
            default: ''
        },
        showDropdownToggle: {
            type: Boolean,
            default: false
        },
        dropDownShowing: {
            type: Boolean,
            default: false
        },
        isLinkInDropdown: {
            type: Boolean,
            default: false
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
        dangers: {
            type: String,
            default: ''
        },
        showIcon: {
            type: Boolean,
            default: false
        },
        icon: {
            type: String,
            default: ''
        },
        secondary: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        getTitleClass(secondary: boolean): any {
            return {
                'secondary': secondary
            };
        },
        chevronDirection(dropDownShowing: boolean): any {
            if (dropDownShowing)
                return 'chevron-down';
            else return 'chevron-right';
        },
        classObject(): any {
            return;
        },
        dropdownClass(showDropdownToggle: boolean): any {
            return {
                'right-end': showDropdownToggle,
                'right': showDropdownToggle
            };
        }
    }
};

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

.my-hidden {
   opacity: 0;
}

.trigger:hover .my-hidden {
    transition: all 0.5s ease-in-out;
    opacity: 1;
}
</style>