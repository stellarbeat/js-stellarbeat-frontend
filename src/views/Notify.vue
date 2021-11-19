<template>
  <div>
    <div class="page-header mt-2">
      <h1 class="page-title">Notify</h1>
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

@Component({
  name: "notify",
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
