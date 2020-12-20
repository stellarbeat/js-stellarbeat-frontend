<template>
    <div class="d-flex flex-column align-items-center justify-content-end">
        <b-table striped hover :responsive="true" :items="nodes" :fields="fields" :sort-by.sync="sortBy"
                 :sort-desc.sync="sortDesc" :per-page="perPage" :current-page="currentPage"
                 :filter="filter" class="mb-0">
            <template v-slot:cell(name)="data">
                <div class="d-flex flex-row justify-content-start align-items-center">
                            <span v-if="data.item.isFullValidator"
                                  class="badge sb-badge badge-success mr-1"
                                  v-b-tooltip.hover title="Full validator">
                                <b-icon-shield/>
                            </span>
                    <div class="mr-1">
                        <router-link
                                :to="{ name: 'node-dashboard', params: { 'publicKey': data.item.publicKey }, query: { 'center': '1' , 'view': $route.query.view, 'network': $route.query.network}}">
                            {{ data.item.name }}
                        </router-link>
                    </div>
                    <b-badge variant="danger" v-b-tooltip="'Node not validating'"
                             v-if="network.getNodeByPublicKey(data.item.publicKey).isValidator && !network.getNodeByPublicKey(data.item.publicKey).isValidating">
                        Failing
                    </b-badge>
                    <b-badge variant="danger" v-b-tooltip="'Quorumset not reaching threshold'"
                             v-if="network.isValidatorBlocked(network.getNodeByPublicKey(data.item.publicKey))">
                        Blocked
                    </b-badge>
                </div>
            </template>
            <template v-slot:cell(organization)="data">
                <router-link v-if="data.item.organizationId"
                             :to="{ name: 'organization-dashboard', params: { 'organizationId': data.item.organizationId, 'view': $route.query.view, 'network': $route.query.network }}">
                    {{ data.item.organization}}
                </router-link>
            </template>
            <template v-slot:cell(type)="row">
                {{row.item.type}}
            </template>
            <template v-slot:cell(version)="data">
                {{data.value || " " | truncate(28)}}
            </template>
            <template v-slot:cell(action)="data">
               <node-actions :node="network.getNodeByPublicKey(data.item.publicKey)"></node-actions>
            </template>
        </b-table>
        <div class="d-flex justify-content-end m-1" v-show="nodes.length >= perPage">
            <b-pagination size="sm" limit="3" class="mb-0" :totalRows="totalRows" :per-page="perPage" v-model="currentPage"/>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';

    import {BBadge, BIconShield, BPagination, BTable, VBTooltip} from 'bootstrap-vue';
    import NodeActions from '@/components/node/sidebar/node-actions.vue';

    @Component(
        {
            components: {NodeActions, BTable, BPagination, BIconShield: BIconShield, BBadge: BBadge},
            directives: {'b-tooltip': VBTooltip}
        })
    export default class NodesTable extends Vue {
        @Prop({default: ''})
        public filter!: string;
        @Prop()
        public fields!: any;
        @Prop()
        public nodes!: Node[];
        @Prop({default: 200})
        public perPage!: number;

        public sortBy: string = 'index';
        public sortDesc: boolean = true;

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

<style>
.action {
    width: 20px;
}
</style>