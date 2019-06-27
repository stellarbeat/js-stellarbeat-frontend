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
                                         href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
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
                        <template slot="validators" slot-scope="row">
                            <ul>
                                <li v-for="validator in row.item.validators">
                                    <span v-if="validator.isFullValidator"
                                          class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
                                          v-b-tooltip.hover title="Full validator">
                                            <i class="fe fe-shield"></i>
                                        </span>
                                    <router-link
                                            :to="{ name: 'quorum-monitor-node', params: { 'publicKey': validator.publicKey }, query: { 'center': '1' }}">

                                        {{ validator.name}}

                                    </router-link>
                                    <span v-if="!validator.active"
                                          class="badge sb-badge badge-danger"
                                    >Not active
                </span>
                                    <span v-if="!validator.isValidating"
                                          class="badge sb-badge badge-danger ml-1"
                                    >Not validating
                </span>
                                </li>
                            </ul>
                        </template>
                        <template slot="failAt" slot-scope="row">
                            <span v-if="row.item.failAt > 1"
                                  class="badge sb-badge badge-success"
                                  v-b-tooltip.hover title="More than 1 validator can fail before this subquorum goes down"
                            >Ok
                            </span>
                            <span v-else-if="row.item.failAt === 1"
                                  class="badge sb-badge badge-warning ml-1"
                                  v-b-tooltip.hover title="If one more validator fails, this subquorum goes down"
                            >Warning
                            </span>
                            <span v-else
                                  class="badge sb-badge badge-danger ml-1"
                                  v-b-tooltip.hover title="This subquorum is failing"
                            >Danger
                            </span>
                        </template>
                        <template slot="name" slot-scope="row">
                            <router-link
                                    :to="{ name: 'organization-details', params: { 'organizationId': row.item.id }}">
                                {{ row.item.name}}
                            </router-link>
                        </template>
                        <template slot="url" slot-scope="row">
                            <a :href="row.item.url" target="_blank">{{row.item.url}}</a>
                        </template>
                        https://keybase.io/
                        <template slot="keybase" slot-scope="row">
                            <a :href="'https://keybase.io/' + row.item.keybase" target="_blank">{{row.item.keybase}}</a>
                        </template>
                        <template slot="email" slot-scope="row">
                            <a v-if="row.item.email" :href="'mailto:' + row.item.email"
                               class="" target="_blank">{{row.item.email}}</a>
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
        public sortBy: string = "failAt";
        public sortDesc: boolean = true;
        public perPage: number = 200;
        public totalRows: number = 1;
        public currentPage: number = 1;
        public filter: string = "";
        public fields = [
            {key: "name", sortable: true},
            {key: "validators", sortable: false},
            {key: "failAt", label: "Subquorum availability", sortable: true},
            {key: "url", sortable: true},
            {key: "keybase", sortable: true},
            {key: "email", sortable: true}
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
                        validators: this.getValidators(organization),
                        keybase: organization.keybase,
                        github: organization.github,
                        url: organization.url,
                        email: organization.officialEmail,
                        id: organization.id,
                        failAt: this.getFailAt(organization)
                    };
                });
        }

        getValidators(organization: Organization) {
            return organization.validators.map(publicKey => {
                let node = this.network.getNodeByPublicKey(publicKey);
                if (node) {
                    return {
                        "name": node.displayName,
                        "publicKey": node.publicKey,
                        "isFullValidator": node.isFullValidator,
                        "isValidating": node.isValidating,
                        "active": node.active
                    };
                } else {
                    return {"publicKey": publicKey, "name": publicKey};
                }
            }).sort((a:any,b:any) => a.name.localeCompare(b.name));
        }

        getFailAt(organization: Organization) {
            let nrOfValidatingNodes = organization.validators
                .map(validator => this.network.getNodeByPublicKey(validator))
                .filter(node => node.isValidating).length;

            let nrOfValidators = organization.validators.length;

            let simpleMajority = Math.floor(nrOfValidators - (nrOfValidators - 1) / 2);

            return nrOfValidatingNodes - simpleMajority + 1;
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

    ul {
        list-style-type: none;
    }
</style>