<template>
    <div class="card card-profile">
        <div class="card-body pb-2 d-flex flex-column text-center justify-content-center align-items-center">
            <h3 class="my-1">
                                <span v-b-tooltip.hover v-if="organization.isTierOneOrganization"
                                      title="Tier one organization" class="badge sb-badge badge-primary-sb">
                            <b-icon-shield/>
                        </span>
                {{organization.name}}
                <b-badge v-if="store.getOrganizationFailAt(organization) <= 0" variant="danger"
                         v-b-tooltip:hover="'More then 50% of its validators are failing'">Failing
                </b-badge>
            </h3>
            <p class="m-2" v-if="organization.description">
                {{organization.description}}
            </p>
            <b-alert class="mt-2" v-else show variant="info">No description found in <a
                    target="_blank" rel="noopener"
                    href="https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0001.md">stellar.toml</a>
            </b-alert>


            <ul class="social-links list-inline mb-2 mt-2">
                <li v-if="organization.url" class="list-inline-item">
                    <a :href="organization.url"
                       v-b-tooltip.hover :title="organization.url"
                       class="social-link"
                       target="_blank" rel="noopener">
                        <b-icon-link scale="1.4"/>
                    </a>
                </li>
                <li v-if="organization.physicalAddress" class="list-inline-item">
                    <a :href="'https://www.google.com/maps/search/?api=1&query=' + organization.physicalAddress"
                       target="_blank" rel="noopener" class="social-link" v-b-tooltip.hover
                       :title="organization.physicalAddress">
                        <b-icon-map scale="1.2"/>
                    </a>
                </li>
                <li v-if="organization.officialEmail" class="list-inline-item">
                    <a class="social-link" v-b-tooltip.hover :title="organization.officialEmail"
                       :href="'mailto:' + organization.officialEmail" target="_blank" rel="noopener">
                        <b-icon-envelope scale="1.2"/>
                    </a>
                </li>
                <li v-if="organization.phoneNumber" class="list-inline-item">
                    <a class="social-link" v-b-tooltip.hover :title="organization.phoneNumber"
                       :href="'tel:' + organization.phoneNumber" target="_blank" rel="noopener">
                        <b-icon-phone scale="1.2"/>
                    </a>
                </li>
                <li v-if="organization.twitter" class="list-inline-item">
                    <a :href="'https://twitter.com/' + organization.twitter" class="social-link"
                       v-b-tooltip.hover title="Twitter"
                       target="_blank" rel="noopener">
                        <twitter/>
                    </a>
                </li>
                <li v-if="organization.github" class="list-inline-item">
                    <a :href="'https://github.com/' + organization.github" target="_blank" rel="noopener"
                       v-b-tooltip.hover title="Github" class="social-link">
                        <github/>
                    </a>
                </li>
                <li v-if="organization.keybase" class="list-inline-item">
                    <a :href="'https://keybase.io/' + organization.keybase" rel="noopener"
                       v-b-tooltip.hover title="Keybase"
                       target="_blank" class="social-link"
                    >
                        <img class="mb-2" width="19px" src="../../../assets/keybase-brands-grey.svg">
                    </a>
                </li>
                <li v-if="organization.horizonUrl" class="list-inline-item">
                    <a :href="organization.horizonUrl"
                       v-b-tooltip.hover title="Horizon"
                       target="_blank" class="social-link" rel="noopener"
                    >
                        <stellar/>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Network, Organization} from '@stellarbeat/js-stellar-domain';
    import {Component, Prop} from 'vue-property-decorator';
    import Github from '@/components/organization/logo/github.vue';
    import Twitter from '@/components/organization/logo/twitter.vue';
    import {BAlert, BBadge, BIconExclamationCircle, BIconLink, BIconMap, BIconShield, VBTooltip, BIconEnvelope} from 'bootstrap-vue';
    import Stellar from '@/components/organization/logo/stellar.vue';


    @Component({
        components: {
            Stellar,
            Twitter,
            Github,
            BAlert: BAlert,
            BIconExclamationTriangle: BIconExclamationCircle,
            BBadge: BBadge,
            BIconLink: BIconLink,
            BIconShield: BIconShield,
            BIconMap: BIconMap,
            BIconEnvelope
        },
        directives: {'b-tooltip': VBTooltip}
    })
    export default class OrganizationProfile extends Vue {
        @Prop()
        organization!: Organization;

        get network(): Network {
            return this.$root.$data.store.network;
        }

        get store() {
            return this.$root.$data.store;
        }

        get notAllArchivesUpToDate() {
            return this.organization.validators
                .map(validator => this.$root.$data.store.network.getNodeByPublicKey(validator)!)
                .some(validator => {
                    return (validator.historyUrl !== undefined && !validator.isFullValidator);
                });
        }


    };
</script>

<style scoped>
    .social-link {
        text-decoration: none;
    }

    hr {
        margin: 0;
        margin-bottom: 4px;
    }
</style>
