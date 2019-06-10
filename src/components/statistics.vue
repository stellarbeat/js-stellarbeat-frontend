<template>
    <div class="row row-cards row-deck">
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <i id="activeNodesTooltip" class="fe fe-info"></i>
                    </div>
                    <b-tooltip target="activeNodesTooltip" placement="top">
                        Number of nodes that were active in the latest crawl.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfActiveNodes}}</div>
                    <div class="text-muted mb-1">Active Nodes</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <i id="ActiveValidatorsTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="ActiveValidatorsTooltip" placement="top">
                        Number of active validators in the latest crawl.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfNodesWithQuorumSets}}</div>
                    <div class="text-muted mb-1">Active Validators</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <i id="fullValidatorsTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="fullValidatorsTooltip" placement="top">
                        Number of active Full Validators in the latest crawl.
                    </b-tooltip>

                    <div class="h1 m-2">{{numberOfFullValidators}}</div>
                    <div class="text-muted mb-1">Full Validators</div>
                </div>
            </div>
        </div>
        <div class="col-sm-3 col-6 ">
            <div class="card">
                <div class="card-body m-2 p-0 text-center">
                    <div class="text-right text-gray info">
                        <i id="FailingValidatorsTooltip" class="fe fe-info"></i>
                    </div>

                    <b-tooltip target="FailingValidatorsTooltip" placement="top">
                        Number of active validators that are not participating in scp or that don't reach their quorumset thresholds.
                    </b-tooltip>
                    <div class="h1 m-2">{{numberOfFailingNodes}}</div>
                    <div class="text-muted mb-1">Failing Validators</div>
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
        return this.network.nodes.filter(node => node.isFullValidator).length;
    }

    get numberOfActiveNodes() {
        return this.network.nodes.filter((node) => node.active).length;
    }

    get numberOfFailingNodes() {
        return this.network.failingNodes.length;
    }

    get numberOfNodesWithQuorumSets() {
        return this.network.nodes.filter((node) => node.active && node.quorumSet.hasValidators()).length;
    }
}
</script>

<style scoped>
    .info {
        float: right;
        padding-bottom: 1px;
    }
</style>