<template>
  <div class="card this-card">
    <div class="card-header">
      <h4 class="card-title">Latest node updates</h4>
    </div>
    <div v-if="failed" class="card-alert alert alert-danger mb-0">
      <b-icon-exclamation-triangle />
      Error fetching data
    </div>
    <div class="card-body py-0 overflow-auto">
      <b-list-group
        v-if="!isLoading"
        flush
        class="w-100 mb-4 list-group-striped"
      >
        <b-list-group-item
          v-for="updatesOnDate in updatesPerDate"
          :key="new Date(updatesOnDate.date).getTime()"
          class="px-0 pb-0 dimmer-content"
        >
          <div class="d-flex justify-content-between flex-wrap">
            <div class="w-75">
              <div class="text-muted mb-1" style="font-size: small">
                {{ new Date(updatesOnDate.date).toLocaleString() }}
              </div>
              <div class="mb-2">
                <div v-for="update in updatesOnDate.updates" :key="update.key">
                  <div v-if="update.key === 'ip'">
                    IP changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'port'">
                    Port changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'quorumSet'">
                    QuorumSet updated
                  </div>
                  <div v-else-if="update.key === 'ledgerVersion'">
                    Ledger updated to version
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'overlayVersion'">
                    Overlay updated to version
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'overlayMinVersion'">
                    Minimum required overlay version is now
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'name'">
                    Name changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'host'">
                    Host changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'homeDomain'">
                    Home domain changed to
                    <a :href="update.value">{{ update.value || "empty" }}</a>
                  </div>
                  <div v-else-if="update.key === 'historyUrl'">
                    History url changed to
                    <a :href="update.value">{{ update.value || "empty" }}</a>
                  </div>
                  <div v-else-if="update.key === 'alias'">
                    Alias changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'isp'">
                    ISP changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'versionStr' && update.value">
                    Stellar core updated to version
                    {{
                      update.value
                        .replace("stellar-core ", "")
                        .replace("v", "")
                        .replace(/ \(.*$/, "")
                        .replace(/\-.*$/, "")
                    }}
                  </div>
                  <div v-else-if="update.key === 'countryName'">
                    Geo location: country changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'organizationId'">
                    Organization changed to
                    {{
                      network.getOrganizationById(update.value)
                        ? network.getOrganizationById(update.value).name
                        : "N/A"
                    }}
                  </div>
                  <div v-else-if="update.key === 'archival'">
                    Node unarchived after period of inactivity
                  </div>
                  <div v-else-if="update.key === 'longitude'">
                    Longitude updated to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-else-if="update.key === 'latitude'">
                    Latitude updated to
                    {{ update.value || "empty" }}
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center mb-2">
              <b-button-toolbar>
                <b-button-group size="sm">
                  <b-button
                    v-b-tooltip="'View diff'"
                    v-on:click="showDiff(updatesOnDate.snapshot)"
                  >
                    <b-icon-file-diff />
                  </b-button>
                  <b-button
                    v-on:click="timeTravel(updatesOnDate.snapshot)"
                    v-b-tooltip="'Travel to this point in time'"
                  >
                    <b-icon-clock />
                  </b-button>
                </b-button-group>
              </b-button-toolbar>
            </div>
          </div>
        </b-list-group-item>
        <b-list-group-item v-if="updatesPerDate.length === 0 && !isLoading">
          No recent updates...
        </b-list-group-item>
      </b-list-group>
      <div v-else class="d-flex justify-content-center mt-5">
        <div class="loader"></div>
      </div>
    </div>
    <b-modal ref="modalDiff" title="Diff" size="lg">
      <div v-html="diffModalHtml"></div>
    </b-modal>
  </div>
</template>
<script setup lang="ts">
import Vue, { Ref, ref, toRefs, watch } from "vue";
import { Node, PublicKey, QuorumSet } from "@stellarbeat/js-stellarbeat-shared";
import { Delta, formatters, create } from "jsondiffpatch";
import "jsondiffpatch/dist/formatters-styles/html.css";

import {
  VBTooltip,
  BModal,
  VBModal,
  BButton,
  BListGroup,
  BListGroupItem,
  BIconFileDiff,
  BButtonGroup,
  BIconClock,
  BButtonToolbar,
} from "bootstrap-vue";
import { isArray } from "@stellarbeat/js-stellarbeat-shared/lib/typeguards";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";

interface Update {
  key: string;
  value: string;
}

interface SnapshotForDelta {
  startDate: Date;
  endDate: Date;
  publicKey: string;
  ip: string | null;
  port: number | null;
  host: string | null;
  name: string | null;
  homeDomain: string | null;
  historyUrl: string | null;
  alias: string | null;
  isp: string | null;
  ledgerVersion: number | null;
  overlayVersion: number | null;
  overlayMinVersion: number | null;
  versionStr: string | null;
  countryCode: string | null;
  countryName: string | null;
  longitude: number | null;
  latitude: number | null;
  organizationId: string | null;
  quorumSet: QuorumSet;
  quorumSetHashKey: string | null;
}

Vue.directive("b-tooltip", VBTooltip);
Vue.directive("b-modal", VBModal);

const props = defineProps<{
  node: Node;
}>();

const node = toRefs(props).node;

const differ = create({
  objectHash(obj: Record<string, unknown>) {
    if (isArray(obj.validators)) {
      return obj.validators.join("");
    }
  },
});

const diffModalHtml = ref("<p>No update selected</p>");
const deltas: Map<string, Delta | undefined> = new Map();

const updatesPerDate: Ref<
  {
    date: string;
    updates: Update[];
    snapshot: SnapshotForDelta;
  }[]
> = ref([]);

const store = useStore();
const network = store.network;
const router = useRouter();
const route = useRoute();
const isLoading = ref(true);
const failed = ref(false);

const modalDiff: Ref<BModal | null> = ref(null);

function showDiff(snapShot: SnapshotForDelta) {
  if (!modalDiff.value) return;
  formatters.html.showUnchanged(true);
  diffModalHtml.value = formatters.html.format(
    deltas.get(snapShot.startDate.toISOString()) as Delta,
    snapShot
  );
  modalDiff.value.show();
}

function mapValidatorsToNames(quorumSet: QuorumSet) {
  quorumSet.validators = quorumSet.validators.map((validator: PublicKey) =>
    network.getNodeByPublicKey(validator) &&
    network.getNodeByPublicKey(validator).name
      ? network.getNodeByPublicKey(validator).name
      : validator
  ) as [];

  quorumSet.innerQuorumSets = quorumSet.innerQuorumSets.map((quorumSet) =>
    mapValidatorsToNames(quorumSet)
  );

  return quorumSet;
}

watch(
  node,
  async () => {
    await getSnapshots();
  },
  { immediate: true }
);

async function getSnapshots() {
  let snapshots: SnapshotForDelta[] = [];
  try {
    deltas.clear();
    updatesPerDate.value = [];
    let fetchedSnapshots = await store.fetchNodeSnapshotsByPublicKey(
      node.value.publicKey
    );
    snapshots = fetchedSnapshots.map((snapshot) => {
      let quorumSet: QuorumSet;
      if (!snapshot.node.quorumSet) quorumSet = new QuorumSet(0);
      else quorumSet = mapValidatorsToNames(snapshot.node.quorumSet);

      return {
        startDate: snapshot.startDate,
        endDate: snapshot.endDate,
        publicKey: snapshot.node.publicKey,
        ip: snapshot.node.ip,
        port: snapshot.node.port,
        host: snapshot.node.host,
        name: snapshot.node.name,
        homeDomain: snapshot.node.homeDomain,
        historyUrl: snapshot.node.historyUrl,
        alias: snapshot.node.alias,
        isp: snapshot.node.isp,
        ledgerVersion: snapshot.node.ledgerVersion,
        overlayVersion: snapshot.node.overlayVersion,
        overlayMinVersion: snapshot.node.overlayMinVersion,
        versionStr: snapshot.node.versionStr,
        countryCode: snapshot.node.geoData.countryCode,
        countryName: snapshot.node.geoData.countryName,
        longitude: snapshot.node.geoData.longitude,
        latitude: snapshot.node.geoData.latitude,
        organizationId: snapshot.node.organizationId,
        quorumSet: quorumSet,
        quorumSetHashKey: snapshot.node.quorumSetHashKey,
      };
    });

    for (let i = snapshots.length - 2; i >= 0; i--) {
      let updates: Update[] = [];
      [
        "latitude",
        "longitude",
        "quorumSet",
        "ip",
        "port",
        "countryName",
        "countryCode",
        "host",
        "name",
        "homeDomain",
        "historyUrl",
        "alias",
        "isp",
        "ledgerVersion",
        "overlayVersion",
        "overlayMinVersion",
        "versionStr",
        "organizationId",
      ]
        .filter((key) =>
          key !== "quorumSet"
            ? //@ts-ignore
              snapshots[i][key] !== snapshots[i + 1][key]
            : snapshots[i].quorumSetHashKey !==
              snapshots[i + 1].quorumSetHashKey
        )
        .forEach((changedKey) =>
          updates.push({
            key: changedKey,
            //@ts-ignore
            value: snapshots[i][changedKey],
          })
        );

      if (
        snapshots[i]["startDate"].getTime() !==
        snapshots[i + 1]["endDate"].getTime()
      ) {
        updates.push({ key: "archival", value: "unArchived" });
      }

      updatesPerDate.value.push({
        date: snapshots[i].startDate.toISOString(),
        updates: updates,
        snapshot: snapshots[i],
      });
      deltas.set(
        snapshots[i].startDate.toISOString(),
        differ.diff(snapshots[i + 1], snapshots[i])
      );
    }
    updatesPerDate.value.reverse();
  } catch (e) {
    failed.value = true;
  }
  isLoading.value = false;
  return snapshots;
}

function timeTravel(snapshot: SnapshotForDelta) {
  router.push({
    name: route.name ? route.name : undefined,
    params: route.params,
    query: {
      view: route.query.view,
      "no-scroll": "1",
      network: route.query.network,
      at: snapshot.startDate.toISOString(),
    },
  });
}
</script>

<style scoped>
.this-card {
  min-height: 200px;
  max-height: 910px;
}
</style>
