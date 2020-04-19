<template>
    <div>
        <b-table striped hover responsive :items="nodes" :fields="fields" :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc" :per-page="perPage" :current-page="currentPage"
                 :filter="filter" class="mb-0">
            <template v-slot:cell(name)="data">
                            <span v-if="data.item.isFullValidator"
                                  class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
                                  v-b-tooltip.hover title="Full validator">
                                <i class="fe fe-shield"></i>
                            </span>
                <router-link :to="{ name: 'node-dashboard', params: { 'publicKey': data.item.publicKey }, query: { 'center': '1' , 'view': $route.query.view}}"> {{ data.item.name }}
                </router-link>
            </template>
            <template v-slot:cell(organization)="data">
                <router-link v-if="data.item.organizationId"
                             :to="{ name: 'organization-dashboard', params: { 'organizationId': data.item.organizationId, 'view': $route.query.view }}">
                    {{ data.item.organization}}
                </router-link>
            </template>
            <template v-slot:cell(type)="row">
                {{row.item.type}}
            </template>
            <template v-slot:cell(version)="data">
                {{data.value || " " | truncate(28)}}
            </template>
        </b-table>
        <b-row v-show="nodes.length >= perPage">
            <b-col md="6" class="my-1">
                <b-pagination :totalRows="totalRows" :per-page="perPage" v-model="currentPage"
                              class="my-1"/>
            </b-col>
        </b-row>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';

    @Component({})
    export default class NodesTable extends Vue {
        @Prop({default: ''})
        public filter!: string;
        @Prop()
        public fields!: any;
        @Prop()
        public nodes!: Node[];

        public sortBy: string = 'index';
        public sortDesc: boolean = true;
        public perPage: number = 200;
        public currentPage: number = 1;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network() {
            return this.store.network;
        }

        get totalRows(): number {
            return this.nodes.length;
        }
    }
</script>

<style scoped>

</style>