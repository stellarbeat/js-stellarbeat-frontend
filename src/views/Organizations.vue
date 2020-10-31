<template>
    <div>
        <div>
            <div class="page-header d-flex justify-content-between">
                <div class="d-flex align-items-center">
                    <h1 class="page-title">Organizations</h1>
                    <simulation-badge class="mr-2"/>
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
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';
    import CrawlTime from '@/components/crawl-time.vue';
    import Store from '@/store/Store';
    import SimulationBadge from '@/components/simulation-badge.vue';
    import TimeTravelBadge from '@/components/time-travel-badge.vue';
    import {BCol, BFormInput, BIconInfoCircle, BIconShield, BPagination, BRow, BTable, VBTooltip} from 'bootstrap-vue';
    import OrganizationsTable from '@/components/organization/organizations-table.vue';

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
    export default class Organizations extends Vue {
        public filter: string = '';
        public fields = [
            {key: 'name', sortable: true},
            {key: 'validators', sortable: false},
            {key: 'subQuorum24HAvailability', label: '24H Availability', sortable: true},
            {key: 'subQuorum30DAvailability', label: '30D Availability', sortable: true},
            {key: 'url', sortable: true},
            {key: 'keybase', sortable: true},
            {key: 'email', sortable: true}
        ];

        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        @Watch('$route', {immediate: true})
        public onRouteChanged(to: any) {
            if (to.query.network) {
                this.store.networkId = to.query.network;
            }
        }

        get store(): Store {
            return this.$root.$data.store;
        }

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
                        failAt: this.getFailAt(organization),
                        subQuorum24HAvailability: organization.subQuorum24HoursAvailability + '%',
                        subQuorum30DAvailability: organization.subQuorum30DaysAvailability + '%',
                        isTierOneOrganization: organization.isTierOneOrganization
                    };
                });
        }

        getValidators(organization: Organization) {
            return organization.validators.map(publicKey => {
                let node = this.network.getNodeByPublicKey(publicKey);
                if (node) {
                    return {
                        'name': node.displayName,
                        'publicKey': node.publicKey,
                        'isFullValidator': node.isFullValidator,
                        'isValidating': node.isValidating,
                        'active': node.active
                    };
                } else {
                    return {'publicKey': publicKey, 'name': publicKey};
                }
            }).sort((a: any, b: any) => a.name.localeCompare(b.name));
        }

        getFailAt(organization: Organization) {
            let nrOfValidatingNodes = organization.validators
                .map(validator => this.network.getNodeByPublicKey(validator))
                .filter(validator => validator !== undefined)
                .filter(node => node!.isValidating).length;

            return nrOfValidatingNodes - organization.subQuorumThreshold + 1;
        }
    }
</script>
<style scoped>
    .header-row {
        width: 100%
    }
</style>