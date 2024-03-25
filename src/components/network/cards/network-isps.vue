<template>
  <div id="isp-list-card" class="card">
    <div class="card-header pl-3">
      <h1 class="card-title">
        {{ store.includeWatcherNodes ? "Node " : "Validator " }} ISPs
      </h1>
    </div>

    <div class="d-flex flex-column align-items-center justify-content-end">
      <b-table
        striped
        hover
        :responsive="true"
        :items="ispList"
        :fields="fields"
        :sort-by.sync="sortBy"
        :sort-desc.sync="sortDesc"
        :per-page="perPage"
        :current-page="currentPage"
        class="mb-0"
      >
        <template #cell(isp)="data">
          {{ data.value }}
        </template>
        <template #cell(count)="data">
          {{ data.value }}
        </template>
        <template #cell(action)="row">
          <b-dropdown
            right
            size="sm"
            text="More"
            class="p-0 m-0"
            boundary="viewport"
            toggle-class="more-button btn-thin"
            no-caret
          >
            <template slot="button-content">
              <b-icon-three-dots-vertical scale="0.9" />
            </template>
            <b-dropdown-header> Simulation options </b-dropdown-header>
            <div>
              <b-dropdown-item
                @click.prevent.stop="simulateFailure(row.item.ispKey)"
              >
                <b-icon-lightning scale="0.9" />
                Halt nodes with ISP
              </b-dropdown-item>
            </div>
          </b-dropdown>
        </template>
      </b-table>
      <div
        v-show="ispList.length >= perPage"
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
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import {
  BDropdown,
  BDropdownHeader,
  BDropdownItem,
  BIconLightning,
  BIconThreeDotsVertical,
  BPagination,
  BTable,
} from "bootstrap-vue";
import useStore from "@/store/useStore";
import { AggregateChange } from "@/services/change-queue/changes/aggregate-change";
import { EntityPropertyUpdate } from "@/services/change-queue/changes/entity-property-update";

const store = useStore();
const network = store.network;

const perPage = ref(5);
const sortBy = ref("count");
const sortDesc = ref(true);
const currentPage = ref(1);

const ispToKeyMap = computed(() => {
  const map = new Map<string, string>();
  network.nodes
    .filter(
      (node) =>
        (node.isValidator && node.isValidating) || store.includeWatcherNodes,
    )
    .forEach((node) => {
      if (node.isp) {
        const ispKey = removeSpecialCharacters(node.isp.toLowerCase());
        map.set(node.isp, ispKey);
      }
    });

  return map;
});

const keyToIspMap = computed(() => {
  const map = new Map<string, string>();
  network.nodes
    .filter(
      (node) =>
        (node.isValidator && node.isValidating) || store.includeWatcherNodes,
    )
    .forEach((node) => {
      if (node.isp) {
        const ispKey = removeSpecialCharacters(node.isp.toLowerCase());
        if (map.has(ispKey)) {
          map.set(ispKey, node.isp);
        } else {
          map.set(ispKey, node.isp);
        }
      }
    });

  return map;
});

const ispList = computed(() => {
  const getIspKeyCountsArray = getCountsArray(
    (
      network.nodes
        .filter(
          (node) =>
            node.isp &&
            ((node.isValidator && node.isValidating) ||
              store.includeWatcherNodes),
        )
        .map((node) => node.isp) as string[]
    ).map((isp) => removeSpecialCharacters(isp.toLowerCase())),
  );

  return getIspKeyCountsArray.map((ispKeyCount) => {
    return {
      isp: keyToIspMap.value.get(ispKeyCount.isp) as string,
      ispKey: ispKeyCount.isp,
      count: ispKeyCount.count,
    };
  });
});

const simulateFailure = function (ispKey: string) {
  const aggregateChange = new AggregateChange(
    network.nodes
      .filter((node) => node.isp && ispToKeyMap.value.get(node.isp) === ispKey)
      .map((node) => {
        return [
          new EntityPropertyUpdate(node, "isValidating", false),
          new EntityPropertyUpdate(node, "activeInScp", false),
        ];
      })
      .flat(),
  );

  store.processChange(aggregateChange);

  nextTick(() => {
    const contentElement = document.getElementById("content");
    if (contentElement) {
      window.scrollTo({
        top: contentElement.offsetTop,
        behavior: "smooth",
      });
    }
  });
};

const totalRows = computed(() => ispList.value.length);

const fields = ref([
  { key: "isp", label: "Isp", sortable: true },
  {
    key: "count",
    label: "Count",
    sortable: true,
  },
  {
    key: "action",
    label: "",
    sortable: false,
    //@ts-ignore
    tdClass: "action",
  },
]);

function removeSpecialCharacters(str: string): string {
  // Regular expression to match special characters
  const regex = /[!@#$%^&*(),.?":{}|<>]/g;

  // Replace special characters with an empty string
  return str.replace(regex, "");
}

function getCountsArray(
  stringsArray: string[],
): { isp: string; count: number }[] {
  const counts: { [key: string]: number } = stringsArray.reduce(
    (acc: { [key: string]: number }, str) => {
      if (acc[str]) {
        acc[str]++;
      } else {
        acc[str] = 1;
      }
      return acc;
    },
    {},
  );

  const uniqueStrings: string[] = Object.keys(counts);

  return uniqueStrings.map((str) => ({
    isp: str,
    count: counts[str],
  }));
}
</script>
