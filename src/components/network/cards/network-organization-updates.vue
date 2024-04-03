<template>
  <div class="card">
    <div class="card-header p-3">
      <h1 class="card-title">Latest updated organizations</h1>
    </div>
    <div v-if="failed" class="card-alert alert alert-danger mb-0">
      <b-icon-exclamation-triangle />
      Error fetching data
    </div>
    <div :class="dimmerClass">
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
                  snapshot.organization.dateDiscovered &&
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
<script setup lang="ts">
import {
  BBadge,
  BIconExclamationTriangle,
  BListGroup,
  BListGroupItem,
} from "bootstrap-vue";
import { OrganizationSnapShot } from "@stellarbeat/js-stellarbeat-shared";
import useStore from "@/store/useStore";
import { useIsLoading } from "@/composables/useIsLoading";
import { onMounted, type Ref, ref } from "vue";
import useOrganizationSnapshotRepository from "@/repositories/useOrganizationSnapshotRepository";

const store = useStore();
const organizationSnapshotRepository = useOrganizationSnapshotRepository();
const network = store.network;
const { isLoading, dimmerClass } = useIsLoading();
const failed = ref(false);
const snapshots: Ref<OrganizationSnapShot[]> = ref([]);

async function getSnapshots() {
  let snapshots: OrganizationSnapShot[] = [];
  const snapshotsOrError = await organizationSnapshotRepository.find(
    network.time,
  );
  if (snapshotsOrError.isErr()) {
    failed.value = true;
  } else {
    snapshots = snapshotsOrError.value;
  }
  isLoading.value = false;
  return snapshots;
}

onMounted(async () => {
  snapshots.value = await getSnapshots();
});
</script>
<style scoped>
.card-columns {
  column-count: 3;
}
</style>
