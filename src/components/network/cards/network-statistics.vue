<template>
    <div class="row row-cards row-deck">
        <div class="col-md-6 col-lg-3">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <b-icon-info-circle id="activeNodesTooltip"/>
                    </div>
                    <b-tooltip target="activeNodesTooltip" placement="top">
                        Number of watcher nodes that were active in the latest crawl.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfActiveWatchers}}</div>
                    <div class="text-muted mb-1">Watcher nodes</div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <b-icon-info-circle id="ActiveValidatorsTooltip"/>
                    </div>

                    <b-tooltip target="ActiveValidatorsTooltip" placement="top">
                        Number of active validators in the latest crawl.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfActiveValidators}}</div>
                    <div class="text-muted mb-1">Validator nodes</div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <b-icon-info-circle id="fullValidatorsTooltip"/>
                    </div>

                    <b-tooltip target="fullValidatorsTooltip" placement="top">
                        Number of active Full Validators in the latest crawl.
                    </b-tooltip>

                    <div class="h1 m-2">{{numberOfActiveFullValidators}}</div>
                    <div class="text-muted mb-1">Full Validators</div>
                </div>
            </div>
        </div>
        <div class="col-md-6 col-lg-3">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <b-icon-info-circle id="FailingValidatorsTooltip"/>
                    </div>

                    <b-tooltip target="FailingValidatorsTooltip" placement="top">
                        Number of detected organizations.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfOrganizations}}</div>
                    <div class="text-muted mb-1">Organizations</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

import {Network, Organization} from '@stellarbeat/js-stellar-domain';
import {BTooltip, BIconInfoCircle} from 'bootstrap-vue';

@Component({
    components: {BTooltip, BIconInfoCircle}
})
export default class NetworkStatistics extends Vue {
    @Prop()
    public network!: Network;

    get numberOfActiveFullValidators() {
        return this.network.nodes.filter(node => node.isFullValidator && !this.network.isNodeFailing(node)).length;
    }

    get numberOfActiveWatchers() {
        return this.network.nodes.filter((node) => !node.isValidator && node.active).length;
    }

    get numberOfActiveValidators() {
        return this.network.nodes.filter((node) => node.active && node.isValidating && !this.network.isNodeFailing(node)).length;
    }

    get numberOfOrganizations() {
        return this.network.organizations.filter(organization => !this.isOrganizationFailing(organization)).length;
    }

    isOrganizationFailing(organization: Organization) {
        let nrOfValidatingNodes = organization.validators
            .map(validator => this.network.getNodeByPublicKey(validator)!)
            .filter(validator => validator !== undefined)
            .filter(node => !this.network.isNodeFailing(node)).length;

        return nrOfValidatingNodes - organization.subQuorumThreshold < 0;
    }
}
</script>

<style scoped>
    .info {
        float: right;
        padding-bottom: 1px;
        opacity: 0.5;
    }
</style>