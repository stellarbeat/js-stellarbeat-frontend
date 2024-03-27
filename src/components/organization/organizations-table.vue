<template>
  <div class="d-flex flex-column align-items-center justify-content-end">
    <b-table
      striped
      hover
      :responsive="true"
      :items="organizations"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :per-page="perPage"
      :current-page="currentPage"
      :filter="filter"
      class="mb-0"
    >
      <template #cell(validators)="row">
        <ul class="validator-list">
          <li
            v-for="validator in row.item.validators"
            :key="validator.publicKey"
          >
            <div class="">
              <span
                v-if="validator.isFullValidator"
                v-tooltip="'Full validator'"
                class="badge sb-badge badge-success pt-1 mr-1"
                title="Full validator"
              >
                <b-icon-shield />
              </span>

              <router-link
                :to="{
                  name: 'node-dashboard',
                  params: { publicKey: validator.publicKey },
                  query: {
                    center: '1',
                    view: $route.query.view,
                    network: $route.query.network,
                  },
                  at: $route.query.at,
                }"
              >
                {{ validator.displayName }}
              </router-link>
              <span
                v-if="network.isNodeFailing(validator)"
                v-tooltip="network.getNodeFailingReason(validator).description"
                class="badge sb-badge badge-danger ml-1"
                >{{ network.getNodeFailingReason(validator).label }}</span
              >
              <span
                v-else-if="
                  NodeWarningDetector.nodeHasWarning(validator, network)
                "
                v-tooltip="
                  NodeWarningDetector.getNodeWarningReasonsConcatenated(
                    validator,
                    network,
                  )
                "
                class="badge sb-badge badge-warning ml-1"
              >
                Warning
              </span>
            </div>
          </li>
        </ul>
      </template>
      <template #head(subQuorum24HAvailability)="data">
        <span class=""
          >{{ data.label }}
          <b-icon-info-circle
            v-tooltip="
              'Availability: more than or equal to 50% of the organization validators are validating.'
            "
            class="text-gray"
          />
        </span>
      </template>
      <template #head(subQuorum30DAvailability)="data">
        <span class=""
          >{{ data.label }}
          <b-icon-info-circle
            v-tooltip="
              'Availability: more than or equal to 50% of the organization validators are validating.'
            "
            class="text-gray"
          />
        </span>
      </template>
      <template #cell(name)="row">
        <div class="d-flex flex-row justify-content-start align-items-center">
          <span
            v-if="row.item.isTierOneOrganization"
            v-tooltip="'Tier one organization'"
            title="Tier one organization"
            class="badge sb-badge badge-primary mr-1"
          >
            <b-icon-shield />
          </span>
          <div class="mr-1">
            <router-link
              :to="{
                name: 'organization-dashboard',
                params: { organizationId: row.item.id },
                query: {
                  view: $route.query.view,
                  network: $route.query.network,
                  at: $route.query.at,
                },
              }"
            >
              {{ row.item.name }}
            </router-link>
          </div>
          <span
            v-if="row.item.failAt === 1"
            v-tooltip="
              'If one more validator fails, this organization will fail'
            "
            class="badge sb-badge badge-warning ml-1"
            title="If one more validator fails, this organization will fail"
            >Warning
          </span>
          <span
            v-else-if="row.item.failAt < 1"
            v-tooltip="row.item.dangers"
            class="badge sb-badge badge-danger ml-1"
            :title="row.item.dangers"
            >{{ row.item.blocked ? "Blocked" : "Failing" }}
          </span>
          <span
            v-else-if="row.item.hasWarning"
            v-tooltip="row.item.warning"
            class="badge sb-badge badge-warning ml-1"
            :title="row.item.warning"
            >Warning
          </span>
        </div>
      </template>
      <template #cell(url)="row">
        <a :href="row.item.url" target="_blank" rel="noopener">{{
          row.item.url
        }}</a>
      </template>
      https://keybase.io/
      <template #cell(keybase)="row">
        <a
          :href="'https://keybase.io/' + row.item.keybase"
          target="_blank"
          rel="noopener"
          >{{ row.item.keybase }}</a
        >
      </template>
      <template #cell(email)="row">
        <a
          v-if="row.item.email"
          :href="'mailto:' + row.item.email"
          class=""
          target="_blank"
          rel="noopener"
          >{{ row.item.email }}</a
        >
      </template>
      <template #cell(action)="data">
        <organization-actions
          :organization="network.getOrganizationById(data.item.id)"
        ></organization-actions>
      </template>
    </b-table>
    <div
      v-show="organizations.length >= perPage"
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
import { computed, ref, toRefs } from "vue";

import {
  BIconInfoCircle,
  BIconShield,
  BPagination,
  BTable,
  BvTableFieldArray,
} from "bootstrap-vue";
import OrganizationActions from "@/components/organization/sidebar/organization-actions.vue";
import useStore from "@/store/useStore";
import { NodeWarningDetector } from "@/services/NodeWarningDetector";

export interface Props {
  filter?: string;
  fields: BvTableFieldArray;
  organizations: TableOrganization[];
  perPage?: number;
  sortBy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  filter: "",
  perPage: 200,
  sortBy: "subQuorum30DAvailability",
});

const { filter, fields, organizations, perPage, sortBy } = toRefs(props);

const sortDesc = ref(true);
const currentPage = ref(1);

const store = useStore();
const network = store.network;

const totalRows = computed(() => props.organizations.length);

export type TableOrganization = {
  name: string;
  id: string;
  isTierOneOrganization?: boolean;
  failAt?: number;
  hasWarning?: boolean;
  warning?: string;
  dangers?: string;
  blocked?: boolean;
  subQuorum24HAvailability?: string;
  subQuorum30DAvailability?: string;
  email?: string;
  keybase?: string;
};
</script>

<style scoped>
ul {
  list-style-type: none;
}

.validator-list {
  padding-left: 0;
  margin-bottom: 0;
}
</style>
