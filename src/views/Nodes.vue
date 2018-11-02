<template>
    <div>
        <div>
            <div class="page-header">
                <h1 class="page-title">
                    Available nodes
                </h1>
                <div class="page-subtitle">Latest crawl on {{lastCrawlDateString}}</div>
            </div>
            <div class="card mb-2 p-3">
                <div class="card-header">
                    <div class="row header-row">
                        <div class="col-12 col-sm-6">
                            <label class="custom-switch mt-2">

                                <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                                       v-model="optionShowInactive">
                                <span class="custom-switch-indicator"></span>
                                <span class="custom-switch-description">Include inactive nodes</span>

                            </label>
                        </div>
                        <div class="col-12 col-sm-6">
                            <input class="form-control search" type="text" v-model.lazy="filter" id="searchInput" placeholder="Type public key, name, ... to search"/>

                        </div>
                    </div>

                </div>
                <div class="card-body">

                <b-table striped hover responsive :items="nodes" :fields="fields" :sort-by.sync="sortBy"
                         :sort-desc.sync="sortDesc" :per-page="perPage" :current-page="currentPage"
                         :filter="filter" @filtered="onFiltered">
                    <!--template slot="publicKey" slot-scope="data">
                        {{data.value | truncate(20)}}
                    </template!-->
                    <template slot="name" slot-scope="data">
                        {{data.value || " " | truncate(20)}}
                    </template>
                    <template slot="version" slot-scope="data">
                        {{data.value || " " | truncate(28)}}
                    </template>
                    <template slot="actions" slot-scope="row">
                        <b-button-group class="btn-group-sm">
                            <router-link class="btn btn-secondary " role="button"
                                         :to="{ name: 'node-details', params: { publicKey: row.item.publicKey }}">
                                Details
                            </router-link>
                            <router-link class="btn btn-secondary" role="button"
                                         :to="{ name: 'quorum-monitor-node', params: { publicKey: row.item.publicKey }, query: { center: 1 }}">
                                Quorum monitor
                            </router-link>
                        </b-button-group>
                    </template>
                </b-table>
            </div>
            <b-row>
                <b-col md="6" class="my-1">
                    <b-pagination :totalRows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0"/>
                </b-col>
            </b-row>
        </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "nodes-table",
        data() {
            return {
                optionShowInactive: 1,
                sortBy: 'Name',
                sortDesc: true,
                perPage: 20,
                currentPage: 1,
                filter: null,
                fields: [
                    {key: 'name', sortable: true},
                    //{ key: 'publicKey', label: 'Public key (first 20 characters)', sortable: true },
                    {key: 'availability', sortable: true},
                    {key: 'version', sortable: true},
                    {key: 'country', sortable: true},
                    {key: 'ip', sortable: true},

                    {key: 'actions', label: ''}
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
                return this.network.nodes
                    .filter(node => node.active || this.optionShowInactive)
                    .map(node => {
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
            totalRows: function () {
                return this.nodes.length;
            },

            lastCrawlDateString: function () {
                return this.network.getLatestCrawlDate() ? this.network.getLatestCrawlDate().toLocaleString() : 'NA';
            }

        },
        methods: {
            onFiltered(filteredItems) {
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
<style scoped>
    .header-row {
        width: 100%
    }
</style>