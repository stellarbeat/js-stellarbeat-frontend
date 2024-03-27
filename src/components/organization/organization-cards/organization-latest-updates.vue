<template>
  <div class="card this-card">
    <div class="card-header">
      <h4 class="card-title">Latest organization updates</h4>
    </div>
    <div v-if="failed" class="card-alert alert alert-danger mb-0">
      <b-icon-exclamation-triangle />
      Error fetching data
    </div>
    <div class="card-body py-0 overflow-auto">
      <b-list-group v-if="!isLoading" flush class="w-100 mb-4">
        <b-list-group-item
          v-for="updatesOnDate in updatesPerDate"
          :key="updatesOnDate.date.getTime()"
          class="px-0 pb-0"
        >
          <div class="d-flex justify-content-between flex-wrap">
            <div class="w-75">
              <div class="text-muted mb-1" style="font-size: small">
                {{ updatesOnDate.date.toLocaleString() }}
              </div>
              <div class="mb-2">
                <div v-for="update in updatesOnDate.updates" :key="update.key">
                  <div v-if="update.key === 'validators'">
                    Validators updated
                  </div>
                  <div v-if="update.key === 'name'">
                    Name changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'dba'">
                    Dba changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'url'">
                    Url changed to
                    <a :href="update.value">{{ update.value || "empty" }}</a>
                  </div>
                  <div v-if="update.key === 'officialEmail'">
                    Official email changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'phoneNumber'">
                    Phone number changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'physicalAddress'">
                    Physical address changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'twitter'">
                    Twitter account changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'github'">
                    Github account changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'keybase'">
                    Keybase account changed to
                    {{ update.value || "empty" }}
                  </div>
                  <div v-if="update.key === 'horizon'">
                    Horizon url changed to
                    <p class="ml-2">"{{ update.value || "empty" }}"</p>
                  </div>
                  <div v-if="update.key === 'description'">
                    Description changed to
                    <p class="ml-2">"{{ update.value || "empty" }}"</p>
                  </div>
                  <div v-if="update.key === 'archival'">
                    Organization unarchived after period of inactivity
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex align-items-center mb-2">
              <b-button-toolbar>
                <b-button-group size="sm">
                  <b-button
                    v-tooltip="'View diff'"
                    @click="showDiff(updatesOnDate.snapshot)"
                  >
                    <b-icon-file-diff />
                  </b-button>
                  <b-button
                    v-tooltip="'Travel to this point in time'"
                    @click="timeTravel(updatesOnDate.snapshot)"
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
import {
  Organization,
  OrganizationSnapShot,
  PublicKey,
} from "@stellarbeat/js-stellarbeat-shared";
import * as jsondiffpatch from "jsondiffpatch";
import * as htmlFormatter from "jsondiffpatch/formatters/html";

import "jsondiffpatch/formatters/styles/html.css";
import "jsondiffpatch/formatters/styles/annotated.css";

import {
  BButton,
  BButtonGroup,
  BButtonToolbar,
  BIconClock,
  BIconExclamationTriangle,
  BIconFileDiff,
  BListGroup,
  BListGroupItem,
  BModal,
  VBModal,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import { useRoute, useRouter } from "vue-router/composables";
import useOrganizationSnapshotRepository from "@/repositories/useOrganizationSnapshotRepository";

interface Update {
  key: string;
  value: unknown;
}

interface SnapshotForDelta {
  validators: string[];
  startDate: Date;
  endDate: Date;
  id: string;
  name: string;
  dba: string | null;
  url: string | null;
  officialEmail: string | null;
  phoneNumber: string | null;
  physicalAddress: string | null;
  twitter: string | null;
  github: string | null;
  description: string | null;
  keybase: string | null;
}

Vue.directive("b-modal", VBModal);

const store = useStore();
const organizationSnapshotRepository = useOrganizationSnapshotRepository();
const router = useRouter();
const route = useRoute();

const differ = jsondiffpatch.create({});
const diffModalHtml = ref("<p>No update selected</p>");
const deltas: Map<string, jsondiffpatch.Delta | undefined> = new Map();

const updatesPerDate: Ref<
  {
    date: Date;
    updates: Update[];
    snapshot: SnapshotForDelta;
  }[]
> = ref([]);

const isLoading = ref(true);
const failed = ref(false);
const modalDiff: Ref<BModal | null> = ref(null);

const props = defineProps<{
  organization: Organization;
}>();

const organization = toRefs(props).organization;

watch(
  organization,
  async () => {
    await getSnapshots();
  },
  { immediate: true },
);

function showDiff(snapShot: SnapshotForDelta) {
  if (!modalDiff.value) return;
  htmlFormatter.showUnchanged(true);
  diffModalHtml.value = htmlFormatter.format(
    deltas.get(snapShot.startDate.toISOString()) as jsondiffpatch.Delta,
    snapShot,
  );
  modalDiff.value.show();
}

async function getSnapshots() {
  let snapshots: SnapshotForDelta[] = [];
  try {
    deltas.clear();
    updatesPerDate.value = [];
    const fetchedSnapshotsOrError =
      await organizationSnapshotRepository.findForOrganization(
        organization.value.id,
        store.network.time,
      );
    if (fetchedSnapshotsOrError.isErr()) {
      failed.value = true;
      return [];
    }
    snapshots = fetchedSnapshotsOrError.value.map(
      (snapshot: OrganizationSnapShot) => {
        return {
          validators: snapshot.organization.validators.map(
            (validator: PublicKey) =>
              store.network.getNodeByPublicKey(validator) &&
              store.network.getNodeByPublicKey(validator).name
                ? (store.network.getNodeByPublicKey(validator).name as string) +
                  " (" +
                  validator +
                  ")"
                : validator,
          ),
          startDate: snapshot.startDate,
          endDate: snapshot.endDate,
          id: snapshot.organization.id,
          name: snapshot.organization.name,
          dba: snapshot.organization.dba,
          url: snapshot.organization.url,
          officialEmail: snapshot.organization.officialEmail,
          phoneNumber: snapshot.organization.phoneNumber,
          physicalAddress: snapshot.organization.physicalAddress,
          twitter: snapshot.organization.twitter,
          github: snapshot.organization.github,
          description: snapshot.organization.description,
          keybase: snapshot.organization.keybase,
          horizon: snapshot.organization.horizonUrl,
        };
      },
    );
    const validatorSort = (a: PublicKey, b: PublicKey) => a.localeCompare(b);
    for (let i = snapshots.length - 2; i >= 0; i--) {
      const updates: Update[] = [];
      [
        "validators",
        "name",
        "dba",
        "url",
        "officialEmail",
        "phoneNumber",
        "physicalAddress",
        "twitter",
        "github",
        "description",
        "keybase",
        "horizon",
      ]
        .filter((key) =>
          key === "validators"
            ? JSON.stringify(snapshots[i][key].sort(validatorSort)) !==
              JSON.stringify(snapshots[i + 1][key].sort(validatorSort))
            : //@ts-ignore
              snapshots[i][key] !== snapshots[i + 1][key],
        )
        .forEach((changedKey) =>
          updates.push({
            key: changedKey,
            //@ts-ignore
            value: snapshots[i][changedKey],
          }),
        );

      if (
        snapshots[i]["startDate"].getTime() !==
        snapshots[i + 1]["endDate"].getTime()
      ) {
        updates.push({ key: "archival", value: "unArchived" });
      }

      updatesPerDate.value.push({
        date: snapshots[i].startDate,
        updates: updates,
        snapshot: snapshots[i],
      });

      deltas.set(
        snapshots[i].startDate.toISOString(),
        differ.diff(snapshots[i + 1], snapshots[i]),
      );
    }
    updatesPerDate.value.reverse();
  } catch (e) {
    isLoading.value = false;
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
