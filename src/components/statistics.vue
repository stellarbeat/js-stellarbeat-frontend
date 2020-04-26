<template>
    <div class="row row-cards row-deck">
        <div class="col-md-6 col-lg-3">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <b-icon-info-circle id="activeNodesTooltip"/>
                    </div>
                    <b-tooltip target="activeNodesTooltip" placement="top">
                        Number of nodes that were active in the latest crawl.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfActiveNodes}}</div>
                    <div class="text-muted mb-1">Active Nodes</div>
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
                    <div class="text-muted mb-1">Active Validators</div>
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

                    <div class="h1 m-2">{{numberOfFullValidators}}</div>
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

import {Network} from '@stellarbeat/js-stellar-domain';

@Component({
    name: 'statistics',
})
export default class Statistics extends Vue {
    @Prop()
    public network!: Network;

    get numberOfFullValidators() {
        return this.network.nodes.filter(node => node.active && node.isValidating && node.isFullValidator).length;
    }

    get numberOfActiveNodes() {
        return this.network.nodes.filter((node) => node.active).length;
    }

    get numberOfActiveValidators() {
        return this.network.nodes.filter((node) => node.active && node.isValidating && !this.network.isNodeFailing(node)).length;
    }

    get numberOfOrganizations() {
        return this.network.organizations.length;
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