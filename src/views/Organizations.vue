<template>
    <div>
        <div>
            <div class="page-header d-flex justify-content-between">
                <div class="d-flex align-items-center">
                    <h1 class="page-title">Organizations</h1>
                    <simulation-badge/>
                    <time-travel-badge/>
                </div>
                <crawl-time class=""/>
            </div>
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
                    <organizations-table :organizations="organizations" :fields="fields" :filter="filter"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Mixins, Prop, Watch} from 'vue-property-decorator';
    import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';
    import CrawlTime from '@/components/crawl-time.vue';
    import Store from '@/store/Store';
    import SimulationBadge from '@/components/simulation-badge.vue';
    import TimeTravelBadge from '@/components/time-travel-badge.vue';
    import {BCol, BFormInput, BIconInfoCircle, BIconShield, BPagination, BRow, BTable, VBTooltip} from 'bootstrap-vue';
    import OrganizationsTable from '@/components/organization/organizations-table.vue';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        name: 'organizations',
        components: {
            OrganizationsTable,
            TimeTravelBadge,
            SimulationBadge,
            CrawlTime,
            BPagination: BPagination,
            BCol: BCol,
            BRow: BRow,
            BTable: BTable,
            BIconShield: BIconShield,
            BFormInput: BFormInput,
            BIconInfoCircle: BIconInfoCircle
        },
        directives: {'b-tooltip': VBTooltip},
        metaInfo: {
            title: 'Organizations - Stellarbeat.io',
            meta: [
                {name: 'description', content: 'Search through all detected organizations'},
            ],
        },
    })
    export default class Organizations extends Mixins(StoreMixin) {
        public filter: string = '';

        get fields():any {
            if(this.store.isSimulation){
                return [
                    {key: 'name', sortable: true},
                    {key: 'validators', sortable: false}
                ];
            } else {
                return [
                    {key: 'name', sortable: true},
                    {key: 'validators', sortable: false},
                    {key: 'subQuorum24HAvailability', label: '24H Availability', sortable: true},
                    {key: 'subQuorum30DAvailability', label: '30D Availability', sortable: true},
                    {key: 'url', sortable: true},
                    {key: 'keybase', sortable: true},
                    {key: 'email', sortable: true}
                ]
            }
        }

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
                        failAt: this.store.getOrganizationFailAt(organization),
                        dangers: this.store.getOrganizationFailingReason(organization),
                        blocked: this.network.isOrganizationBlocked(organization),
                        subQuorum24HAvailability: organization.subQuorum24HoursAvailability + '%',
                        subQuorum30DAvailability: organization.subQuorum30DaysAvailability + '%',
                        isTierOneOrganization: organization.isTierOneOrganization
                    };
                });
        }

        getValidators(organization: Organization) {
            return organization.validators.map(publicKey => {
                return this.network.getNodeByPublicKey(publicKey);

            }).sort((a: any, b: any) => a.displayName.localeCompare(b.displayName));
        }
    }
</script>
<style scoped>
    .header-row {
        width: 100%
    }
</style>