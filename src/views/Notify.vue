<template>
  <div>
    <!--consent /!-->
    <div class="page-header mt-2 py-3">
      <h1 class="page-title mr-2">Notify</h1>
    </div>
    <div class="card">
      <div class="card-body">
        <router-view />
      </div>
      <div
        class="card-footer"
        v-show="$route.name && !$route.name.match('privacy')"
      >
        <div class="d-flex privacy-link">
          <router-link
            class="nav-link"
            :to="{
              name: 'privacy',
              query: {
                view: $route.query.view,
                network: $route.query.network,
                at: $route.query.at,
              },
            }"
          >
            Privacy policy
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import * as myUseStore from "@/store/useStore";
import Consent from "@/components/consent.vue";
const myStore = myUseStore.default();

export default {
  metaInfo: {
    title: `Notify | ${myStore.appConfig.brandName}`,
    meta: [
      {
        name: "description",
        content: "Get notified on network, node or organization events",
      },
    ],
  },
};
</script>
<style scoped>
.privacy-link {
  justify-content: flex-end;
}
</style>
