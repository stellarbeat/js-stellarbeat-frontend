<template>
    <div>
        <div>
            <div class="page-header d-flex justify-content-between">
                <div class="d-flex align-items-center">
                    <h1 class="page-title">Nodes</h1>
                    <simulation-badge class="mr-2"/>
                    <time-travel-badge/>
                </div>
                <crawl-time class=""/>
            </div>
            <div class="card mb-2 p-1">
                <div class="card-header">
                    <div class="row header-row">
                        <div class="col-12 col-sm-6">
                            <div class="row">
                                <div class="col-sm-6">
                                    <label class="custom-switch mt-2">
                                        <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                                               v-model="optionShowInactive">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description">Include inactive nodes</span>

                                    </label>
                                </div>
                                <div class="col-sm-6">
                                    <label class="custom-switch mt-2">

                                        <input name="custom-switch-checkbox" class="custom-switch-input" type="checkbox"
                                               v-model="optionShowWatchers">
                                        <span class="custom-switch-indicator"></span>
                                        <span class="custom-switch-description">Include watcher nodes</span>

                                    </label>
                                </div>
                            </div>
                        </div>
                        <div class="col-12 col-sm-6">
                            <b-form-input class="form-control search mr-0" type="text" v-model="filter"
                                          id="searchInput"
                                          placeholder="Type public key, name, ... to search"/>

                        </div>
                    </div>

                </div>
                <div class="card-body">
                    <nodes-table :fields="fields" :nodes="nodes" :filter="filter"/>
                </div>

            </div>
            <div class="card mb-2" v-if="!store.isSimulation">
                <div class="card-body">
                    <div class="text-wrap">
                        <h2 class="mt-0 mb-4">Index formula</h2>
                        <pre><code>
Index = (TypeIndex + ActiveIndex + ValidationIndex + VersionIndex + TrustIndex + AgeIndex)/6

TypeIndex = Full validator | Basic validator | Watcher node
ActiveIndex = Active percentage last 30 days
ValidationIndex = Validation percentage last 30 days
Version = How far away from the latest stable Stellar core version
Trust = How many active validators trust this node
Age = Time since discovery
                        </code></pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import CrawlTime from '@/components/crawl-time.vue';
    import Store from '@/store/Store';
    import SimulationBadge from '@/components/simulation-badge.vue';
    import NodesTable from '@/components/node/nodes-table.vue';
    import TimeTravelBadge from '@/components/time-travel-badge.vue';
    import {BFormInput} from 'bootstrap-vue';

    @Component({
        components: {TimeTravelBadge, NodesTable, SimulationBadge, CrawlTime, BFormInput: BFormInput},
        metaInfo: {
            title: 'Nodes overview - Stellarbeat.io',
            meta: [
                {name: 'description', content: 'Search through all available nodes'},
            ],
        },
    })
    export default class Nodes extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        public optionShowInactive: boolean = false;
        public optionShowWatchers: boolean = false;
        public filter: string = '';

        get store(): Store {
            return this.$root.$data.store;
        }

        @Watch('$route', {immediate: true})
        public onRouteChanged(to: any) {
            if (to.query.network) {
                this.store.networkId = to.query.network;
            }
        }

        get fields(): any {
            if (this.store.isSimulation) {
                return [{key: 'name', sortable: true},
                    {key: 'organization', sortable: true},
                    {key: 'type', label: 'type', sortable: true}];
            } else {
                return [
                    {key: 'name', sortable: true},
                    {key: 'organization', sortable: true},
                    {key: 'type', label: 'type', sortable: true},
                    // { key: 'publicKey', label: 'Public key (first 20 characters)', sortable: true },
                    {key: 'active24Hour', label: '24H active', sortable: true},
                    {key: 'active30Days', label: '30D active', sortable: true},
                    {key: 'validating24Hour', label: '24H validating', sortable: true},
                    {key: 'validating30Days', label: '30D validating', sortable: true},
                    {key: 'overLoaded24Hour', label: '24H overloaded', sortable: true},
                    {key: 'index', label: 'index', sortable: true},
                    {key: 'validating', sortable: true},
                    {key: 'version', sortable: true},
                    {key: 'country', sortable: true},
                    {key: 'ip', sortable: true},

                    {key: 'actions', label: ''},
                ];
            }


        }

        get nodes(): any[] {
            return this.network.nodes
                .filter((node) => node.active || this.optionShowInactive)
                .filter((node) => node.isValidator || this.optionShowWatchers)
                .map((node) => {
                    return {
                        name: node.displayName,
                        type: node.isFullValidator ? 'Full validator' : node.isValidator ? 'Validator' : 'Watcher',
                        active24Hour: node.statistics.has24HourStats ? node.statistics.active24HoursPercentage + '%' : 'NA',
                        active30Days: node.statistics.has30DayStats ? node.statistics.active30DaysPercentage + '%' : 'NA',
                        validating24Hour: node.statistics.has24HourStats ? node.statistics.validating24HoursPercentage + '%' : 'NA',
                        validating30Days: node.statistics.has30DayStats ? node.statistics.validating30DaysPercentage + '%' : 'NA',
                        overLoaded24Hour: node.statistics.has24HourStats ? node.statistics.overLoaded24HoursPercentage + '%' : 'NA',
                        ip: node.key,
                        publicKey: node.publicKey,
                        country: node.geoData.countryName,
                        version: node.versionStr,
                        isFullValidator: node.isFullValidator,
                        isValidator: node.isValidator,
                        index: node.index,
                        validating: node.isValidating,
                        organization: this.getOrganization(node),
                        organizationId: node.organizationId
                    };
                });
        }

        getOrganization(node: Node): string {
            if (!node.organizationId) {
                return '-';
            }
            let organization = this.network.getOrganizationById(node.organizationId);
            if (organization) {
                return organization.name;
            } else {
                return '-';
            }
        }
    }
</script>
<style scoped>
    .header-row {
        width: 100%
    }
</style>