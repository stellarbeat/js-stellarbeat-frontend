<template>
    <div>
        <div>
            <div class="page-header">
                <h1 class="page-title">
                    Organizations
                </h1>
                <div class="page-subtitle">Latest crawl on {{latestCrawlDateString}}</div>
            </div>
            <b-alert show variant="info"><strong>Organization detection (experimental):</strong> Support <a
                    target="_blank"
                    href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md">sep-0020</a>
                and update the linked <a target="_blank"
                                         href="https://www.stellar.org/developers/guides/concepts/stellar-toml.html">stellar.toml</a>
                file to include your organization info.
            </b-alert>
            <div class="card mb-2 p-1">
                <div class="card-header">
                    <div class="row header-row">
                        <div class="col-12 col-sm-6">
                            <b-form-input class="form-control search mr-0" type="text" v-model="filter"
                                          id="searchInput"
                                          placeholder="Search"/>

                        </div>
                    </div>

                </div>
                <div class="card-body">

                    <b-table striped hover responsive :items="organizations" :fields="fields" :sort-by.sync="sortBy"
                             :sort-desc.sync="sortDesc" :per-page="perPage" :current-page="currentPage"
                             :filter="filter" @filtered="onFiltered">
                        <template slot="validators" slot-scope="data">

                            {{data.item.validators}}
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
    import {Network, Node, Organization} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "organizations-table",
        metaInfo: {
            title: "Organizations - Stellarbeat.io",
            meta: [
                {name: "description", content: "Search through all detected organizations"},
            ],
        },
    })
    export default class Organizations extends Vue {
        public sortBy: string = "name";
        public sortDesc: boolean = true;
        public perPage: number = 200;
        public totalRows:number = 1;
        public currentPage: number = 1;
        public filter: string = "";
        public fields = [
            {key: "name", sortable: true},
            {key: "validators", sortable: false},

        ];

        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        get organizations(): any[] {
            return this.network.organizations
                .map((organization) => {
                    return {
                        name: organization.name,
                        validators: this.getValidators(organization)
                    };
                });
        }

        getValidators(organization:Organization) {
            return organization.validators.map(publicKey => {
                let node = this.network.getNodeByPublicKey(publicKey);
                if(node) {
                    return node.displayName;
                } else {
                    return publicKey;
                }
            })
        }

        get latestCrawlDateString(): string {
            return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : "NA";
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
    .header-row {
        width: 100%
    }
</style>