<template>
  <div class="card">
    <div class="card-header p-3">
      <h1 class="card-title">Latest updated organizations</h1>
    </div>
    <div v-if="failed" class="card-alert alert alert-danger mb-0">
      <b-icon-exclamation-triangle />
      Error fetching data
    </div>
    <div v-bind:class="dimmerClass">
      <div class="loader mt-2"></div>
      <div class="dimmer-content">
        <b-list-group v-if="!isLoading" flush class="w-100 mb-4 card-columns">
          <b-list-group-item
            v-for="snapshot in snapshots"
            :key="snapshot.organization.id + snapshot.startDate"
            class="px-3 py-2"
          >
            <div class="text-muted mb-0" style="font-size: small">
              {{ snapshot.startDate.toLocaleString() }}
              <b-badge
                v-if="snapshot.startDate.getTime() === network.time.getTime()"
                variant="info"
                >current crawl</b-badge
              >
            </div>
            <div class="d-flex align-items-center ml-2">
              <div class="mr-1">
                <router-link
                  :to="{
                    name: 'organization-dashboard',
                    params: {
                      organizationId: snapshot.organization.id,
                    },
                    query: {
                      network: $route.query.network,
                      at: $route.query.at,
                    },
                  }"
                >
                  {{ snapshot.organization.name }}
                </router-link>
              </div>
              <b-badge
                v-if="
                  snapshot.startDate.getTime() ===
                  snapshot.organization.dateDiscovered.getTime()
                "
                variant="success"
                >New</b-badge
              >
            </div>
          </b-list-group-item>
        </b-list-group>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import {
  BBadge,
  BIconSearch,
  BTable,
  BIconExclamationTriangle,
  BListGroup,
  BListGroupItem,
} from "bootstrap-vue";
import { StoreMixin } from "@/mixins/StoreMixin";
//import AsyncComputed from 'vue-async-computed-decorator';
import { IsLoadingMixin } from "@/mixins/IsLoadingMixin";
import { OrganizationSnapShot } from "@stellarbeat/js-stellar-domain";

@Component({
  components: {
    BIconSearch: BIconSearch,
    BBadge: BBadge,
    BTable,
    BIconExclamationTriangle,
    BListGroup,
    BListGroupItem,
  },
})
export default class NetworkValidatorUpdates extends Mixins(
  StoreMixin,
  IsLoadingMixin
) {
  failed = false;
  snapshots: OrganizationSnapShot[] = [];

  async getSnapshots() {
    let snapshots: OrganizationSnapShot[] = [];
    try {
      snapshots = await this.store.fetchOrganizationSnapshots();
    } catch (e) {
      this.failed = true;
    }
    this.isLoading = false;
    return snapshots;
  }

  async mounted() {
    this.snapshots = await this.getSnapshots();
  }
}
</script>
<style scoped>
.card-columns {
  column-count: 3;
}
</style>
