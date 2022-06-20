<template>
  <div class="card" id="public-horizon-apis-card">
    <div class="card-header pl-3">
      <h1 class="card-title">Public Horizon API's</h1>
    </div>
    <div class="card-body p-0">
      <b-list-group flush class="w-100 mb-4 card-columns">
        <b-list-group-item
          class="px-3 py-3"
          v-for="horizon in horizons"
          :key="horizon.name"
        >
          <a :href="horizon.url" target="_blank" rel="noopener">{{
            horizon.name
          }}</a>
        </b-list-group-item>
      </b-list-group>
    </div>
  </div>
</template>
<script lang="ts">
import { Component } from "vue-property-decorator";
import Vue from "vue";
import { Network } from "@stellarbeat/js-stellar-domain";
import Store from "@/store/Store";
import { BListGroup, BListGroupItem } from "bootstrap-vue";

@Component({
  components: { BListGroup, BListGroupItem },
})
export default class NetworkHorizon extends Vue {
  get store(): Store {
    return this.$root.$data.store;
  }

  get network(): Network {
    return this.store.network;
  }

  get horizons() {
    return this.network.organizations
      .filter((organization) => organization.horizonUrl)
      .map((organization) => {
        return {
          name: organization.name,
          url: organization.horizonUrl,
        };
      });
  }
}
</script>
