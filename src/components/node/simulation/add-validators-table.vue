<template>
    <div>
        <b-form-input class="form-control search mr-0" type="text" v-model="filter" id="searchInput"
                      placeholder="Type public key, name, ... to search"/>
        <b-table striped hover responsive :items="nodes" :fields="fields" :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc" :per-page="perPage"
                 :filter="filter" @filtered="onFiltered" selectable
                 @row-selected="rowSelected"
                 :select-mode="mode"
                 :current-page="currentPage"
                 selectedVariant="success">
            <template v-slot:cell(name)="row">
                            <span v-if="row.item.isFullValidator"
                                  class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
                                  v-b-tooltip.hover title="Full validator">
                                <b-icon-shield/>
                            </span>
                {{ row.item.name || " " | truncate(20)}}
            </template>

            <template v-slot:cell(version)="data">
                {{data.value || " " | truncate(28)}}
            </template>
        </b-table>

        <b-pagination :totalRows="totalRows" :per-page="perPage" v-model="currentPage" ref="paginator"
                      class="my-1"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Model} from 'vue-property-decorator';

    import {Node} from '@stellarbeat/js-stellar-domain';
    import {BFormInput, BIconShield, BPagination, BTable, VBTooltip} from 'bootstrap-vue';

    @Component({
        name: 'add-validators-table',
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

    export default class AddValidatorsTable extends Vue {
        @Prop()
        public validators!: Node[];

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
            {key: 'availability', sortable: true},
            {key: 'index', label: 'index (experimental)', sortable: true},
            {key: 'version', sortable: true}
        ];

        get nodes(): any[] {
            return this.validators
                .map((node) => {
                    return {
                        name: node.displayName,
                        version: node.versionStr,
                        isFullValidator: node.isFullValidator,
                        index: node.index,
                        publicKey: node.publicKey
                    };
                });
        }

        rowSelected(items: Node[]) {
            this.$emit('validators-selected', items);
        }

        public onFiltered = (filteredItems: any[]) => {
            this.totalRows = 1;
            (this.$refs.paginator as any)._data.currentPage = 1;
            (this.$refs.paginator as any)._data.localNumPages = Math.round(filteredItems.length / this.perPage);
            //reactivity doesn't work on currentPage and totalRows. why?
        };

        mounted() {
            // Set the initial number of items
            this.totalRows = this.nodes.length;
        }

    }
</script>

<style scoped>

</style>