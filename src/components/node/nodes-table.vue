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
      <template v-slot:cell(name)="data">
        <div class="d-flex flex-row justify-content-start align-items-center">
          <span
            v-if="data.item.isFullValidator"
            class="badge sb-badge badge-success mr-1"
            v-b-tooltip.hover
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
                network.getNodeByPublicKey(data.item.publicKey)
              )
            "
            variant="danger"
            v-b-tooltip="
              network.getNodeFailingReason(
                network.getNodeByPublicKey(data.item.publicKey)
              ).description
            "
          >
            {{
              network.getNodeFailingReason(
                network.getNodeByPublicKey(data.item.publicKey)
              ).label
            }}
          </b-badge>
          <b-badge
            v-else-if="
              network.nodeHasWarnings(
                network.getNodeByPublicKey(data.item.publicKey)
              )
            "
            v-b-tooltip="
              network.getNodeWarningReasons(
                network.getNodeByPublicKey(data.item.publicKey)
              )
            "
            variant="warning"
          >
            Warning
          </b-badge>
        </div>
      </template>
      <template v-slot:cell(organization)="data">
        <router-link
          v-if="data.item.organizationId"
          :to="{
            name: 'organization-dashboard',
            params: {
              organizationId: data.item.organizationId,
              view: $route.query.view,
              network: $route.query.network,
              at: $route.query.at,
            },
          }"
        >
          {{ data.item.organization }}
        </router-link>
      </template>
      <template v-slot:cell(type)="row">
        {{ row.item.type }}
      </template>
      <template v-slot:cell(version)="data">
        {{ truncate(data.value, 28) || " " }}
      </template>
      <template v-slot:cell(action)="data">
        <node-actions
          :node="network.getNodeByPublicKey(data.item.publicKey)"
        ></node-actions>
      </template>
    </b-table>
    <div
      class="d-flex justify-content-end m-1"
      v-show="nodes.length >= perPage"
    >
      <b-pagination
        size="sm"
        limit="3"
        class="mb-0"
        :totalRows="totalRows"
        :per-page="perPage"
        v-model="currentPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Vue, { computed, ref, withDefaults } from "vue";
import { Node } from "@stellarbeat/js-stellar-domain";

import {
  BBadge,
  BIconShield,
  BPagination,
  BTable,
  VBTooltip,
} from "bootstrap-vue";
import NodeActions from "@/components/node/sidebar/node-actions.vue";
import useStore from "@/store/useStore";
import { useTruncate } from "@/mixins/useTruncate";

Vue.directive("b-tooltip", VBTooltip);

export interface Props {
  filter: string;
  fields: unknown;
  nodes: Node[];
  perPage: number;
}

const { filter, fields, nodes, perPage } = withDefaults(defineProps<Props>(), {
  filter: "",
  perPage: 200,
});

const truncate = useTruncate();

const sortBy = ref("  index");
const sortDesc = ref(true);

const currentPage = ref(1);

const store = useStore();
const network = store.network;

const totalRows = computed(() => nodes.length);
</script>
