<template>
    <div>
        <div class="page-header  mt-2">
            <h1 class="page-title">
                Organization info
            </h1>
            <crawl-time></crawl-time>
        </div>
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>
        </div>
        <div v-else>
            <div class="row row-cards">
                <div class="col-sm-12">
                    <div class="card card-profile">
                        <div class="card-body text-center mt-5 align-content-center">
                            <h3 class="mb-3">
                                <span v-b-tooltip.hover v-if="organization.isTierOneOrganization" title="Tier one organization" class="badge sb-badge badge-primary">
                            <i class="fe fe-shield"/>
                        </span>
                                {{organization.name}}
                            </h3>
                            <p class="m-4">
                                {{organization.description}}
                            </p>
                            <b-alert class="mx-5" v-if="!organization.description" show variant="info">Update your <a
                                    target="_blank"
                                    href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
                                file to include a description
                            </b-alert>


                            <ul class="social-links list-inline mb-4 mt-2">
                                <li v-if="organization.url" class="list-inline-item">
                                    <a :href="organization.url"
                                       v-b-tooltip.hover :title="organization.url"
                                       class="social-link"
                                       target="_blank">
                                        <i class="fe fe-link"></i>
                                    </a>
                                </li>
                                <li v-if="organization.physicalAddress" class="list-inline-item">
                                    <a :href="'https://www.google.com/maps/search/?api=1&query=' + organization.physicalAddress"
                                       target="_blank" class="social-link" v-b-tooltip.hover
                                       :title="organization.physicalAddress"><i class="fe fe-map-pin"> </i>
                                    </a>
                                </li>
                                <li v-if="organization.officialEmail" class="list-inline-item">
                                    <a class="social-link" v-b-tooltip.hover :title="organization.officialEmail"
                                       :href="'mailto:' + organization.officialEmail" target="_blank"><i
                                            class="fe fe-mail"> </i>
                                    </a>
                                </li>
                                <li v-if="organization.phoneNumber" class="list-inline-item">
                                    <a class="social-link" v-b-tooltip.hover :title="organization.phoneNumber"
                                       :href="'tel:' + organization.phoneNumber" target="_blank">
                                        <i class="fe fe-phone"> </i>
                                    </a>
                                </li>
                                <li v-if="organization.twitter" class="list-inline-item">
                                    <a :href="'https://twitter.com/' + organization.twitter" class="social-link"
                                       v-b-tooltip.hover title="Twitter"
                                       target="_blank">
                                        <i class="fe fe-twitter"></i></a>
                                </li>
                                <li v-if="organization.github" class="list-inline-item">
                                    <a :href="'https://github.com/' + organization.github" target="_blank"
                                       v-b-tooltip.hover title="Github" class="social-link"><i
                                            class="fe fe-github"> </i>
                                    </a>
                                </li>
                                <li v-if="organization.keybase" class="list-inline-item">
                                    <a :href="'https://keybase.io/' + organization.keybase"
                                       v-b-tooltip.hover title="Keybase"
                                       target="_blank" class="social-link"
                                    >
                                        <img class="mb-2" width="16px" src="../assets/keybase-brands-grey.svg">

                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row row-cards">
                <div class="col-sm-6 col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Validators</h3>
                        </div>
                        <div class="card-body p-O">
                            <b-list-group flush>
                                <b-list-group-item v-for="validator in validators">
                                    <span v-if="validator.isFullValidator"
                                          class="badge sb-badge badge-success full-validator-badge pt-1 mr-1"
                                          v-b-tooltip.hover title="Full validator">
                                            <i class="fe fe-shield"></i>
                                        </span>
                                    <router-link
                                            :to="{ name: 'quorum-monitor-node', params: { 'publicKey': validator.publicKey }, query: { 'center': '1' }}">
                                        {{ validator.displayName}}

                                    </router-link>
                                    <span v-if="!validator.active"
                                          class="badge sb-badge badge-danger ml-1"
                                    >Not active
                </span>
                                    <span v-if="!validator.isValidating"
                                          class="badge sb-badge badge-danger ml-1"
                                    >Not validating
                </span>
                                </b-list-group-item>
                            </b-list-group>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-4">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Subquorum Availability</h3>
                        </div>
                        <div class="card-body text-center">
                            <h1 class="mb-2 mt-2"><span v-if="failAt > 1"
                                                        class="badge sb-badge badge-success"
                                                        v-b-tooltip.hover
                                                        :title="'At least ' + failAt + ' validators have to fail to bring this subquorum down'"
                            ><i class="fe fe-check-circle"></i>
                            </span>
                                <span v-else-if="failAt === 1"
                                      class="badge sb-badge badge-warning ml-1"
                                      v-b-tooltip.hover title="If one more validator fails, this subquorum will fail"
                                ><i class="fe fe-alert-circle"></i>
                            </span>
                                <span v-else
                                      class="badge sb-badge badge-danger ml-1"
                                      v-b-tooltip.hover title="This subquorum is failing"
                                >Failing
                            </span>
                            </h1>
                            <div class="list-group list-group-flush nested-tree px-4 pb-4">
                                <!--div class="list-group-item p-1 pr-0">

                                </div!-->
                                <div class="list-group-item p-1 pr-0">
                                    <b-progress height="1rem">
                                        <b-progress-bar :value="organization.subQuorum24HoursAvailability"
                                                        v-bind:variant="organization.subQuorum24HoursAvailability === 100 ? 'success ' : 'warning'">
                                            24H availability: {{organization.subQuorum24HoursAvailability}}%
                                        </b-progress-bar>
                                    </b-progress>
                                </div>
                                <div class="list-group-item p-1 pr-0">
                                    <b-progress height="1rem">
                                        <b-progress-bar :value="organization.subQuorum30DaysAvailability"
                                                        v-bind:variant="organization.subQuorum30DaysAvailability > 99.9 ? 'success ' : 'warning'">
                                            30D availability: {{organization.subQuorum30DaysAvailability}}%
                                        </b-progress-bar>
                                    </b-progress>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-12 col-md-4">
                    <history-card
                            :subject="'Subquorum Availability history'"
                            :entityId="organization.id"
                            :fetchDayMeasurements="(organizationId, from, to) => store.organizationMeasurementStore.getDayMeasurements(organizationId, from, to)"
                            :fetchMeasurements="(organizationId, from, to) => store.organizationMeasurementStore.getMeasurements(organizationId, from, to)"
                            :dayMeasurementProperty="'isSubQuorumAvailableCount'"
                            :measurementProperty="'isSubQuorumAvailable'"
                    >
                    </history-card>
                    </div>
            </div>
            </div>

        </div>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node, Organization, Network} from "@stellarbeat/js-stellar-domain";
    import Store from '@/store/Store';
    import CrawlTime from '@/components/crawl-time.vue';
    import HistoryCard from '@/components/node/node-cards/history-card.vue';

    @Component({
        name: "organization-details",
        components: {HistoryCard, CrawlTime},
        metaInfo: {
            title: "Organization info - Stellarbeat.io",
            meta: [
                {name: "description", content: "Info about an organization"},
            ],
        },
    })
    export default class NodeDetails extends Vue {
        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        get organization(): Organization | undefined {
            return this.network.getOrganizationById(this.$route.params.organizationId);
        }

        get validators(): (Node | any)[] {
            if(!this.organization)
                return [];
            return this.organization.validators
                .map(publicKey => this.network.getNodeByPublicKey(publicKey)!)
                .sort((a: Node, b: Node) => a.displayName.localeCompare(b.displayName));
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get failAt() {
            if(!this.organization){
                return 0;
            }
            let nrOfValidatingNodes = this.organization.validators
                .map(validator => this.network.getNodeByPublicKey(validator)!)
                .filter(node => node.isValidating).length;

            return nrOfValidatingNodes - this.organization.subQuorumThreshold + 1;
        }
    }
</script>

<style scoped>
    .no-margin {
        margin-left: 0px!important;
    }
    .social-link {
        text-decoration: none;
    }

    .full-width-badge {
        width: 100%
    }

    .info {
        float: right;
        padding-bottom: 1px;
    }

    .card-body {
        padding: 0 !important;
    }

    ul {
        list-style-type: none;
    }
</style>