<template>
    <div>
        <div>
            <div class="page-header">
                <h1 class="page-title">
                    Available nodes
                </h1>
                <div class="page-subtitle">Latest crawl on {{latestCrawlDateString}}</div>
            </div>
            <b-alert show variant="info"><strong>Full validator detection (experimental):</strong> Support <a
                    target="_blank"
                    href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md">sep-0020</a>
                and update the linked <a target="_blank"
                                         href="https://www.stellar.org/developers/guides/concepts/stellar-toml.html">stellar.toml</a>
                file to include your up-to-date history archive.
            </b-alert>
            <div class="card mb-2 p-1">
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
                            <b-form-input class="form-control search mr-0" type="text" v-model="filter" id="searchInput"
                                          placeholder="Type public key, name, ... to search"/>

                        </div>
                    </div>

                </div>
                <div class="card-body">

                    <b-table striped hover responsive :items="nodes" :fields="fields" :sort-by.sync="sortBy"
                             :sort-desc.sync="sortDesc" :per-page="perPage" :current-page="currentPage"
                             :filter="filter" @filtered="onFiltered">
                        <template slot="name" slot-scope="row">
                            <span v-if="row.item.isFullValidator"
                                  class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
                                  v-b-tooltip.hover title="Full validator">
                                <i class="fe fe-shield"></i>
                            </span>
                            <router-link
                                    :to="{ name: 'quorum-monitor-node', params: { 'publicKey': row.item.publicKey }, query: { 'center': '1' }}">{{ row.item.name || " " | truncate(20)}}
                            </router-link>
                        </template>

                        <template slot="type" slot-scope="row">
                            {{row.item.type}}
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
                                             :to="{ name: 'quorum-monitor-node', params: { 'publicKey': row.item.publicKey }, query: { 'center': '1' }}">
                                    Quorum monitor
                                </router-link>
                            </b-button-group>
                        </template>
                    </b-table>
                    <b-row>
                        <b-col md="6" class="my-1">
                            <b-pagination :totalRows="totalRows" :per-page="perPage" v-model="currentPage"
                                          class="my-1"/>
                        </b-col>
                    </b-row>
                </div>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import {Network, Node} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "nodes-table",
        metaInfo: {
            title: "Nodes overview - Stellarbeat.io",
            meta: [
                {name: "description", content: "Search through all available nodes"},
            ],
        },
    })
    export default class NodeDetails extends Vue {
        public optionShowInactive: number = 1;
        public sortBy: string = "index";
        public sortDesc: boolean = true;
        public perPage: number = 20;
        public currentPage: number = 1;
        public filter: string = "";
        public fields = [
            {key: "name", sortable: true},
            {key: "type", label: "type (experimental)", sortable: true},
            // { key: 'publicKey', label: 'Public key (first 20 characters)', sortable: true },
            {key: "availability", sortable: true},
            {key: "index", label: "index (experimental)", sortable: true},
            {key: "load", sortable: true},
            {key: "version", sortable: true},
            {key: "country", sortable: true},
            {key: "ip", sortable: true},

            {key: "actions", label: ""},
        ];

        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        get nodes(): any[] {
            return this.network.nodes
                .filter((node) => node.active || this.optionShowInactive)
                .map((node) => {
                    return {
                        name: node.displayName,
                        type: node.isFullValidator ? "Full validator" : node.isValidator ? "Validator" : "Watcher",
                        availability: node.statistics.activeRating * 20 + "%",
                        load: this.getLoad(node),
                        ip: node.key,
                        publicKey: node.publicKey,
                        country: node.geoData.countryName,
                        version: node.versionStr,
                        isFullValidator: node.isFullValidator,
                        index: node.index
                    };
                });
        }

        get totalRows(): number {
            return this.nodes.length;
        }

        get latestCrawlDateString(): string {
            return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : "NA";
        }

        public onFiltered = (filteredItems: any[]) => {
            // Trigger pagination to update the number of buttons/pages due to filtering
            // this.totalRows = filteredItems.length;
            this.currentPage = 1;
        };

        public getLoad = (node: Node) => {
            switch (true) {
                case node.statistics.activeRating === 0:
                    return "NA";
                case node.statistics.overLoadedRating <= 2:
                    return "low";
                case node.statistics.overLoadedRating <= 4:
                    return "medium";
                case node.statistics.overLoadedRating <= 5:
                    return "high";
            }
        };
    }
</script>
<style scoped>
    .header-row {
        width: 100%
    }
</style>