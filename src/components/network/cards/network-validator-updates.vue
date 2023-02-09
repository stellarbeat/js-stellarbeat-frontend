<template>
  <div class="card">
    <div class="card-header p-3">
      <h1 class="card-title">Latest updated validators</h1>
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
            :key="snapshot.node.publicKey + snapshot.startDate"
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
                    name: 'node-dashboard',
                    params: {
                      publicKey: snapshot.node.publicKey,
                    },
                    query: {
                      network: $route.query.network,
                      at: $route.query.at,
                    },
                  }"
                >
                  {{ snapshot.node.displayName }}
                </router-link>
              </div>
              <b-badge
                v-if="
                  snapshot.startDate.getTime() ===
                  snapshot.node.dateDiscovered.getTime()
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
import { NodeSnapShot } from "@stellarbeat/js-stellarbeat-shared/lib/node-snap-shot";
import useStore from "@/store/useStore";
import { useIsLoading } from "@/composables/useIsLoading";
import { onMounted, Ref, ref } from "vue";

const store = useStore();
const network = store.network;

const { isLoading, dimmerClass } = useIsLoading();

const failed = ref(false);
const snapshots: Ref<NodeSnapShot[]> = ref([]);

async function getSnapshots() {
  let snapshots: NodeSnapShot[] = [];
  try {
    snapshots = await store.fetchNodeSnapshots();
  } catch (e) {
    failed.value = true;
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
