<template>
    <div>
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>

        </div>
        <div v-else>
            <b-alert show variant="info"><strong>Organization detection (experimental):</strong> Support <a
                    target="_blank"
                    href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0020.md">sep-0020</a>
                and update the linked <a target="_blank"
                                         href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
                file to include your organization info.
            </b-alert>
            <div class="page-header  mt-2">
                <h1 class="page-title">
                    {{organization.name}}
                </h1>
                <div class="page-subtitle">{{organization.description}}</div>
            </div>
            <div class="row">
                <div class="col-sm-6 col-6 ">
                    <div class="card">
                        <div class="card-body m-2 p-0 text-center">
                            <div class="text-right text-gray info">
                                <i id="activeValidatorsTooltip" class="fe fe-info"></i>
                            </div>
                            <b-tooltip target="activeValidatorsTooltip" placement="top">
                                Number of active validators
                            </b-tooltip>
                            <div class="h1 m-2">{{validators.filter(validator => validator.active).length}} /
                                {{validators.length}}
                            </div>
                            <div class="text-muted mb-1">Active Validators</div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6 col-6 ">
                    <div class="card">
                        <div class="card-body m-2 p-0 text-center">
                            <div class="text-right text-gray info">
                                <i id="activeFullValidatorsTooltip" class="fe fe-info"></i>
                            </div>
                            <b-tooltip target="activeFullValidatorsTooltip" placement="top">
                                Number of active full validators
                            </b-tooltip>
                            <div class="h1 m-2">{{validators.filter(validator => validator.active &&
                                validator.isFullValidator).length}} / {{validators.length}}
                            </div>
                            <div class="text-muted mb-1">Active Full Validators</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row row-cards">
                <div class="col-md-6">
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
                                          class="badge sb-badge badge-danger"
                                    >Not active
                </span>
                                    <span v-if="!validator.isValidating"
                                          class="badge sb-badge badge-danger"
                                    >Not validating
                </span>
                                </b-list-group-item>
                            </b-list-group>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Contact</h3>
                        </div>
                        <div class="card-body">
                            <b-list-group flush>

                                <!--b-list-group-item v-if="organization.dba">
                                    <i class="fe fe-briefcase"> </i> {{organization.dba}}
                                </b-list-group-item!-->
                                <b-list-group-item v-if="organization.physicalAddress">
                                    <a :href="'https://www.google.com/maps/search/?api=1&query=' + organization.physicalAddress"
                                       target="_blank"><i class="fe fe-map-pin"> </i>
                                        {{organization.physicalAddress}}</a>
                                </b-list-group-item>


                                <b-list-group-item v-if="organization.officialEmail">
                                    <a :href="'mailto:' + organization.officialEmail" target="_blank"><i
                                            class="fe fe-mail"> </i>
                                        {{organization.officialEmail}}</a>
                                </b-list-group-item>
                                <b-list-group-item v-if="organization.phoneNumber">
                                    <i class="fe fe-phone"> </i> {{organization.phoneNumber}}
                                </b-list-group-item>
                                <b-list-group-item v-if="organization.twitter">
                                    <a :href="'https://twitter.com/' + organization.twitter" target="_blank"><i
                                            class="fe fe-twitter"> </i>
                                        {{organization.twitter}}</a>
                                </b-list-group-item>
                                <b-list-group-item v-if="organization.github">
                                    <a :href="'https://github.com/' + organization.github" target="_blank"><i
                                            class="fe fe-github"> </i>
                                        {{organization.github}}</a>
                                </b-list-group-item>
                                <b-list-group-item v-if="organization.keybase">
                                    <a :href="'https://keybase.io/' + organization.keybase" target="_blank">
                                        <img width="35px" src="./../assets/Keybase_logo_official.svg">

                                        {{organization.keybase}}</a>
                                </b-list-group-item>
                            </b-list-group>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node, Organization, Network} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "organization-details",
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

        get organization(): Organization {
            return this.network.getOrganizationById(this.$route.params.organizationId);
        }

        get validators(): (Node | any)[] {
            return this.organization.validators
                .map(publicKey => this.network.getNodeByPublicKey(publicKey))
                .sort((a: Node, b: Node) => a.displayName.localeCompare(b.displayName));
        }

        get latestCrawlDateString() {
            return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : "NA";
        }
    }
</script>

<style scoped>
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