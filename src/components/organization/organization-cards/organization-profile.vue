<template>
    <div class="card card-profile">
        <div class="card-body text-center mt-5 align-content-center">
            <h3 class="mb-3">
                                <span v-b-tooltip.hover v-if="organization.isTierOneOrganization"
                                      title="Tier one organization" class="badge sb-badge badge-primary">
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
                        <img class="mb-2" width="16px" src="../../../assets/keybase-brands-grey.svg">
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>
<script lang="ts">
    export default {
        name: 'OrganizationProfile',
        props: {
            organization: {}
        }
    };
</script>

<style scoped>
    .social-link {
        text-decoration: none;
    }
</style>
