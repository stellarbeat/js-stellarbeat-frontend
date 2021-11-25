<template>
  <div>
    <div class="page-header mt-2">
      <h1 class="page-title mr-2">Notify</h1>
      <b-badge variant="warning">Beta</b-badge>
    </div>
    <div class="card">
      <div class="card-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import { StoreMixin } from "@/mixins/StoreMixin";
import { BBadge } from "bootstrap-vue";

@Component({
  name: "notify",
  components: {
    "b-badge": BBadge,
  },
  metaInfo: {
    title: "Notify - Stellarbeat.io",
    meta: [
      {
        name: "description",
        content: "Get notified on network, node or organization events",
      },
    ],
  },
})
export default class Notify extends Mixins(StoreMixin) {}
</script>
