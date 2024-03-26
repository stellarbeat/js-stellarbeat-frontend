<template>
  <div>
    <nav class="navbar navbar-expand-lg m-0 p-0">
      <div class="header py-4 my-header">
        <div class="container-fluid" style="max-width: 1360px">
          <div class="d-flex justify-content-between w-100">
            <div class="d-flex">
              <router-link
                class="header-brand mr-0 mt-0"
                :to="{ name: 'network-dashboard' }"
              >
                <img
                  rel="preload"
                  src="@/assets/logo.svg"
                  class="header-brand-img mr-0"
                  width="400"
                  height="460"
                  :alt="brandLogo ? brandLogo.alt : undefined"
                />
              </router-link>
              <h2 class="brand-title mb-0">{{ brandName }}</h2>
            </div>
            <div class="d-none d-lg-flex">
              <div class="d-flex">
                <div class="nav-item pr-0" style="cursor: default">
                  <nav-network-selector />
                  <a
                    href="https://github.com/stellarbeat"
                    class="btn btn-sm btn-outline-primary"
                    target="_blank"
                    rel="noopener"
                  >
                    <github />
                    Github
                  </a>
                  <a
                    :href="`mailto:${store.appConfig.brandEmail}`"
                    class="btn btn-sm btn-outline-primary ml-2"
                    target="_blank"
                  >
                    Mail
                  </a>
                </div>
              </div>
            </div>
            <button
              class="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#nav_collapse"
              aria-controls="nav_collapse"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <b-icon-list />
            </button>
          </div>
        </div>
      </div>
    </nav>
    <NavCollapse
      :api-doc-url="apiDocUrl"
      :blog-url="blogUrl"
      :github-url="githubUrl"
      :mail-to="mailTo"
      :include-organizations="includeOrganizations"
      :include-notify="includeNotify"
      :include-faq="includeFAQ"
      :faq-route="faqRoute"
      :brand-name="brandName"
      :brand-tagline="brandTagline"
      :brand-logo="brandLogo"
    />
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";
import NavNetworkSelector from "@/components/layout/NavNetworkSelector.vue";
import NavCollapse from "@/components/layout/NavCollapse.vue";
import Github from "@/components/organization/logo/github.vue";
import useStore from "@/store/useStore";

export interface BrandLogo {
  src: string;
  alt: string;
}

defineProps({
  faqRoute: {
    type: String,
    required: false,
    default: undefined,
  },
  brandName: {
    type: String,
    required: true,
  },
  brandTagline: {
    type: String,
    required: true,
  },
  includeOrganizations: {
    type: Boolean,
    default: true,
  },
  includeNotify: {
    type: Boolean,
    default: false,
  },
  includeFAQ: {
    type: Boolean,
    default: false,
  },
  apiDocUrl: {
    type: String,
    default: undefined,
  },
  blogUrl: {
    type: String,
    default: undefined,
  },
  githubUrl: {
    type: String,
    default: undefined,
  },
  mailTo: {
    type: String,
    default: undefined,
  },
  brandLogo: {
    type: Object as PropType<BrandLogo>,
    required: false,
    default: undefined,
  },
});
const store = useStore();
</script>

<style lang="scss" scoped>
.brand-title {
  color: #4a4a4a; // $primary;
  font-weight: normal;
  font-style: normal;
  font-family: "Poppins", sans-serif;
  font-size: 23px;
  margin-top: 4px;
  margin-left: 3px;
  //filter: brightness(1.5);
}
.brand-tagline {
  font-weight: 600;
}

.collapser {
  background: white;
}

.my-header {
  width: 100%;
}

.my-navbar-toggle {
  border: none;
}
</style>
