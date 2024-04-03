<template>
  <div class="d-flex flex-column align-items-center justify-content-end">
    <b-table
      striped
      hover
      :responsive="true"
      :items="nodes"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :per-page="perPage"
      :current-page="currentPage"
      :filter="filter"
      class="mb-0"
    >
      <template #cell(name)="data">
        <div class="d-flex flex-row justify-content-start align-items-center">
          <span
            v-if="data.item.isFullValidator"
            v-tooltip="'Full validator'"
            class="badge sb-badge badge-success mr-1"
            title="Full validator"
          >
            <b-icon-shield />
          </span>
          <div class="mr-1">
            <router-link
              :to="{
                name: 'node-dashboard',
                params: { publicKey: data.item.publicKey },
                query: {
                  center: '1',
                  view: $route.query.view,
                  network: $route.query.network,
                  at: $route.query.at,
                },
              }"
            >
              {{ data.item.name }}
            </router-link>
          </div>
          <b-badge
            v-if="
              network.isNodeFailing(
                network.getNodeByPublicKey(data.item.publicKey),
              )
            "
            v-tooltip="
              network.getNodeFailingReason(
                network.getNodeByPublicKey(data.item.publicKey),
              ).description
            "
            variant="danger"
          >
            {{
              network.getNodeFailingReason(
                network.getNodeByPublicKey(data.item.publicKey),
              ).label
            }}
          </b-badge>
          <b-badge
            v-else-if="
              NodeWarningDetector.nodeHasWarning(
                network.getNodeByPublicKey(data.item.publicKey),
                network,
              )
            "
            v-tooltip="
              NodeWarningDetector.getNodeWarningReasonsConcatenated(
                network.getNodeByPublicKey(data.item.publicKey),
                network,
              )
            "
            variant="warning"
          >
            Warning
          </b-badge>
        </div>
      </template>
      <template #cell(organization)="data">
        <router-link
          v-if="data.item.organizationId"
          :to="{
            name: 'organization-dashboard',
            params: {
              organizationId: data.item.organizationId,
            },
            query: {
              view: $route.query.view,
              network: $route.query.network,
              at: $route.query.at,
              center: true,
            },
          }"
        >
          {{ data.item.organization }}
        </router-link>
      </template>
      <template #cell(type)="row">
        {{ row.item.type }}
      </template>
      <template #cell(version)="data">
        {{ truncate(data.value, 28) || " " }}
      </template>
      <template #cell(action)="data">
        <node-actions
          :node="network.getNodeByPublicKey(data.item.publicKey)"
        ></node-actions>
      </template>
    </b-table>
    <div
      v-show="nodes.length >= perPage"
      class="d-flex justify-content-end m-1"
    >
      <b-pagination
        v-model="currentPage"
        size="sm"
        limit="3"
        class="mb-0"
        :total-rows="totalRows"
        :per-page="perPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, withDefaults } from "vue";

import {
  BBadge,
  BIconShield,
  BPagination,
  BTable,
  type BvTableFieldArray,
} from "bootstrap-vue";
import NodeActions from "@/components/node/sidebar/node-actions.vue";
import useStore from "@/store/useStore";
import { useTruncate } from "@/composables/useTruncate";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

export interface Props {
  filter?: string;
  fields: BvTableFieldArray;
  nodes: TableNode[];
  perPage?: number;
  sortBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filter: "",
  perPage: 200,
  sortBy: "index",
});

const { filter, fields, nodes, perPage, sortBy } = toRefs(props);

const truncate = useTruncate();

const sortDesc = ref(true);

const currentPage = ref(1);

const store = useStore();
const network = store.network;

const totalRows = computed(() => nodes.value.length);

export type TableNode = {
  name: string;
  publicKey: string;
  organization?: string;
  organizationId?: string;
  type?: string;
  version?: string;
  action?: string;
  isFullValidator?: boolean;
  active24Hour?: string;
  active30Days?: string;
  validating24Hour?: string;
  validating30Days?: string;
  isp?: string;
  country?: string;
  overLoaded24Hour?: string;
  ip?: string;
  isValidator?: boolean;
  index?: number;
  validating: boolean;
};
</script>
