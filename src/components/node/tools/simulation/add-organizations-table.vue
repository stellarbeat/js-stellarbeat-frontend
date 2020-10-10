<template>
    <div>
        <b-form-input class="form-control search mr-0" type="text" v-model="filter" id="searchInput"
                      placeholder="Type name, ... to search"/>
        <b-table striped hover responsive :items="organizations" :fields="fields" :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc" :per-page="perPage"
                 :filter="filter" @filtered="onFiltered" selectable
                 @row-selected="rowSelected"
                 :select-mode="mode"
                 :current-page="currentPage"
                 selectedVariant="success">
            <template v-slot:cell(name)="row">
                            <span v-if="row.item.isTierOneOrganization"
                                  class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
                                  v-b-tooltip.hover title="Tier 1 organization">
                                <b-icon-shield/>
                            </span>
                {{ row.item.name }}
            </template>
        </b-table>

        <b-pagination :totalRows="totalRows" :per-page="perPage" v-model="currentPage" ref="paginator"
                      class="my-1"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Model} from 'vue-property-decorator';

    import {Node, Organization} from '@stellarbeat/js-stellar-domain';
    import {BFormInput, BIconShield, BPagination, BTable, VBTooltip} from 'bootstrap-vue';

    @Component({
        components: {
            BFormInput: BFormInput,
            BTable: BTable,
            BIconShield: BIconShield,
            BPagination: BPagination
        },
        directives: {
            'b-tooltip': VBTooltip
        }
    })

    export default class AddOrganizationsTable extends Vue {
        @Prop()
        public organizations!: Organization[];

        public mode: string = 'multi';
        public optionShowInactive: number = 1;
        public sortBy: string = 'index';
        public sortDesc: boolean = true;
        public perPage: number = 10;
        public currentPage: number = 1;
        public filter: string = '';
        public totalRows: number = 1;
        public fields = [
            {key: 'name', sortable: true},
            {key: 'availability', sortable: true, label: '30D availability'}
        ];

        rowSelected(items: Node[]) {
            this.$emit('organizations-selected', items);
        }

        public onFiltered = (filteredItems: any[]) => {
            this.totalRows = 1;
            (this.$refs.paginator as any)._data.currentPage = 1;
            (this.$refs.paginator as any)._data.localNumPages = Math.round(filteredItems.length / this.perPage);
            //reactivity doesn't work on currentPage and totalRows. why?
        };

        mounted() {
            // Set the initial number of items
            this.totalRows = this.organizations.length;
        }

    }
</script>

<style scoped>

</style>