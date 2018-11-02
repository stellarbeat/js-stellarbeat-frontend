<template>
    <div>
    <div v-if="isLoading" class="row">
        <div class="col-5"></div>
        <div class="col-2 loader"></div>
        <div class="col-5"></div>

    </div>
    <div v-else>
        <div class="page-header">
            <h1 class="page-title">
                Available nodes
            </h1>
            <div class="page-subtitle">Last crawl on TODO UTC</div>
        </div>
        <b-card class="mb-2 p-3">
            <b-row>
                <b-col md="6"></b-col>
                <b-col md="6" class="my-1">
                    <b-form-group horizontal label="Search" label-sr-only class="mb-0">
                        <b-input-group>
                            <b-form-input v-model="filter" placeholder="Type public key, name, ... to search" />
                            <b-input-group-append>
                                <b-btn :disabled="!filter" @click="filter = ''">Clear</b-btn>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>
            </b-row>
            <b-table striped hover responsive :items="nodes" :fields="fields" :sort-by.sync="sortBy"
                     :sort-desc.sync="sortDesc" :per-page="perPage" :current-page="currentPage"
                     :filter="filter" @filtered="onFiltered" >
                <!--template slot="publicKey" slot-scope="data">
                    {{data.value | truncate(20)}}
                </template!-->
                <template slot="name" slot-scope="data">
                    {{data.value  || " " | truncate(20)}}
                </template>
                <template slot="version" slot-scope="data">
                    {{data.value || " " | truncate(28)}}
                </template>
                <template slot="actions" slot-scope="row">
                    <b-button-group class="btn-group-sm">
                    <router-link class="btn btn-secondary " role="button" :to="{ name: 'node-details', params: { publicKey: row.item.publicKey }}">Details</router-link>
                    <router-link class="btn btn-secondary" role="button" :to="{ name: 'quorum-monitor-node', params: { publicKey: row.item.publicKey }, query: { center: 1 }}">Quorum monitor</router-link>
                    </b-button-group>
                </template>
            </b-table>
        </b-card>
        <b-row>
            <b-col md="6" class="my-1">
                <b-pagination :totalRows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
            </b-col>
        </b-row>
    </div>
    </div>
</template>

<script>
    export default {
        name: "nodes-table",
        data() {
            return {
                sortBy: 'Name',
                sortDesc: true,
                perPage: 20,
                currentPage: 1,
                filter: null,
                fields: [
                    { key: 'name', sortable: true },
                    //{ key: 'publicKey', label: 'Public key (first 20 characters)', sortable: true },
                    { key: 'availability', sortable: true },
                    { key: 'version', sortable: true},
                    { key: 'country', sortable: true },
                    { key: 'ip', sortable: true },

                    { key: 'actions', label: '' }
                ],
            }
        },
        props: {
            network: {
                type: Object
            },
            isLoading: {
                type: Boolean
            }
        },
        computed: {
            nodes: function () {
                return this.network.nodes.map( node => {
                    return {
                        "name": node.displayName,
                        "availability": node.statistics.activeRating * 20 + "%",
                        "ip": node.key,
                        "publicKey": node.publicKey,
                        "country": node.geoData.countryName,
                        "version": node.versionStr
                    }
                })
            },
            totalRows: function() {
                return this.nodes.length;
            }
        },
        methods: {
            onFiltered (filteredItems) {
                // Trigger pagination to update the number of buttons/pages due to filtering
                //this.totalRows = filteredItems.length;
                this.currentPage = 1;
            }
        },
        mounted() {

        },
        beforeDestroy: function () {
        }
    }
</script>

<style>
    .progress-bar-striped {
        background-color: #1997c6;
        opacity: 0.6;
    }
</style>