<template>
  <div
    v-on:click="$emit('click')"
    v-on:keyup.enter="$emit('click')"
    v-on:keyup.space="$emit('click')"
    :class="classObject"
    v-on:mouseenter="hover = true"
    v-on:mouseleave="hover = false"
    role="button"
    tabindex="0"
    class="d-flex justify-content-between"
  >
    <div
      class="w-100 d-flex flex-row justify-content-between align-items-center"
    >
      <div class="w-100 d-flex flex-column align-items-stretch">
        <div class="w-100 d-flex align-items-center align-content-center">
          <div class="sb-nav-link-icon align-content-center">
            <b-icon
              :icon="chevronDirection"
              scale="0.8"
              v-if="showDropdownToggle"
            />
            <b-icon v-else-if="showIcon" :icon="icon" scale="0.8" />
          </div>

          <div
            class="w-100 d-flex justify-content-between align-content-center"
          >
            <nav-title
              :title="title"
              :classes="'w-100 pb-0 m-height ' + (secondary ? 'secondary' : '')"
              :has-warnings="hasWarnings"
              :warnings="warnings"
              :has-danger="hasDanger"
              :complete-danger="completeDanger"
              :danger="dangers"
            />
          </div>
        </div>
        <div v-if="showSubTitle" class="text-muted sub-title">
          {{ subTitle }}
        </div>
      </div>
      <div class="action mr-1">
        <div :class="dropdownClass" v-show="hover">
          <slot name="action-dropdown" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Vue, { computed, defineProps, ref } from "vue";
import NavTitle from "@/components/side-bar/nav-title.vue";

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
  BBadge,
  BIconPencil,
  BIconBroadcast,
} from "bootstrap-vue";

Vue.component("BIconPlus", BIconPlus);
Vue.component("BIconDownload", BIconDownload);
Vue.component("BIconChevronRight", BIconChevronRight);
Vue.component("BIconChevronDown", BIconChevronDown);
Vue.component("BIconLightning", BIconLightning);
Vue.component("BIconLightningFill", BIconLightningFill);
Vue.component("BIconGearWide", BIconGearWide);
Vue.component("BIconGear", BIconGear);
Vue.component("BIconSearch", BIconSearch);
Vue.component("BBadge", BBadge);
Vue.component("BIconPencil", BIconPencil);
Vue.component("BIconBroadcast", BIconBroadcast);

const props = defineProps({
  title: { type: String, required: true },
  showSubTitle: { type: Boolean, default: false },
  subTitle: { type: String, default: "" },
  showDropdownToggle: { type: Boolean, default: false },
  dropDownShowing: { type: Boolean, default: false },
  isLinkInDropdown: { type: Boolean, default: false },
  hasWarnings: { type: Boolean, default: false },
  warnings: { type: String, default: "" },
  hasDanger: { type: Boolean, default: false },
  completeDanger: { type: Boolean, default: true },
  dangers: { type: String, default: "" },
  showIcon: { type: Boolean, default: false },
  icon: { type: String, default: "" },
  secondary: { type: Boolean, default: false },
});

const hover = ref(false);

const chevronDirection = computed(() => {
  if (props.dropDownShowing) return "chevron-down";
  else return "chevron-right";
});

const classObject = computed(() => {
  return {
    "sb-nav-dropdown-toggle": false,
    "sb-nav-link": !props.isLinkInDropdown,
    "sb-nav-dropdown-link": props.isLinkInDropdown,
  };
});

const dropdownClass = computed(() => {
  return {
    "right-end": !props.showDropdownToggle,
    right: props.showDropdownToggle,
  };
});
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
  color: rgba(0, 0, 0, 0.55);
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
  line-height: 0.99;
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
  vertical-align: 0.272em;
  width: 0.32em;
  height: 0.32em;
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.7s ease;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

.sb-nav-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.55);
  width: 100%;
  font-weight: 400;
  font-size: 90%;
  padding: 1px 4px 1px 4px;
}

.sb-nav-dropdown-link:hover {
  background-color: #f8f9fa;
}
</style>
