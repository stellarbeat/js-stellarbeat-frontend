<template>
  <div class="">
    <slot name="title"></slot>
    <div>
      <b-table
        id="network-analysis-table"
        :items="tableItems"
        :fields="fields"
        :per-page="perPage"
        thead-class="my-thead"
        tbody-class="my-tbody"
        :current-page="currentPage"
      >
        <template #cell()="data">
          <ul class="horizontal-list">
            <li
              class="horizontal-list-item"
              v-for="(item, index) in data.item.key"
              :key="index"
            >
              <span
                v-if="showNodesPartition"
                v-b-tooltip.hover
                :title="
                  nodesPartition.has(item)
                    ? nodesPartition.get(item).join(', ')
                    : 'N/A'
                "
                class="tag mb-1"
                >{{ item }}</span
              >
              <span v-else class="tag mb-1">{{ item }}</span>
            </li>
          </ul>
        </template>
      </b-table>
      <b-pagination
        v-model="currentPage"
        :total-rows="rows"
        :per-page="perPage"
        aria-controls="network-analysis-table"
      ></b-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from "vue-property-decorator";
import {
  BFormInput,
  BModal,
  BButton,
  BFormCheckbox,
  BFormSelect,
  BTable,
  BPagination,
  BBadge,
  BCard,
  BCardBody,
  BCardText,
  BCollapse,
  VBToggle,
  BCardHeader,
  VBTooltip,
} from "bootstrap-vue";
import { StoreMixin } from "@/mixins/StoreMixin";

@Component({
  components: {
    BFormInput,
    BModal,
    BButton,
    BFormCheckbox,
    BFormSelect,
    BTable,
    BPagination,
    BBadge,
    BCard,
    BCardBody,
    BCardText,
    BCollapse,
    BCardHeader,
  },
  directives: { "b-toggle": VBToggle, "b-tooltip": VBTooltip },
})
export default class Analysis extends Mixins(StoreMixin) {
  @Prop()
  items!: Array<Array<string>>;
  @Prop()
  title!: string;
  @Prop()
  nodesPartition!: Map<string, string[]>;
  @Prop({ default: false })
  showNodesPartition!: boolean;

  protected fields = [
    {
      key: "key",
      label: this.title,
    },
  ];
  protected perPage = 5;
  protected currentPage = 1;

  get tableItems() {
    return this.items.map((item) => {
      return {
        key: item,
      };
    });
  }

  get rows() {
    return this.items.length;
  }
}
</script>
<style>
.my-thead tr th {
  color: #495057;
  text-transform: none;
  font-size: 0.9375rem;
  font-weight: 700;
}

.my-tbody tr td {
}
.horizontal-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  padding-bottom: 0px;
  margin-bottom: 0px;
  padding-left: 0px;
}
.horizontal-list-item {
  margin-right: 4px;
}
</style>
