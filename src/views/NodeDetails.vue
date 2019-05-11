<template>
    <div>
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>

        </div>
        <div v-else>
            <div class="page-header  mt-2">
                <h1 class="page-title">
                    Node info
                </h1>
                <div class="page-subtitle">Latest crawl on {{latestCrawlDateString}}</div>
            </div>
            <div class="card mb-2 p-1">
                <div class="card-body">
                    <b-table stacked striped hover responsive :items="items">
                        <template slot="quorumSet" slot-scope="row">
                            <router-link class="btn btn-secondary btn-sm" role="button"
                                         :to="{ name: 'quorum-monitor-node', params: { publicKey: row.item.publicKey }}">
                                Go
                                to quorum monitor
                            </router-link>
                        </template>
                    </b-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

import {Node, Network} from '@stellarbeat/js-stellar-domain';

@Component({
    name: 'node-details',
    metaInfo: {
        title: 'Node info - Stellarbeat.io',
        meta: [
            {name: 'description', content: 'Info about a single node'},
        ],
    },
})
export default class NodeDetails extends Vue {
    @Prop()
    public network!: Network;
    @Prop()
    public isLoading!: boolean;

    get node(): Node {
        return this.network.getNodeByPublicKey(this.$route.params.publicKey);
    }

    get items() {
        if (!this.node) {
            return [];
        }
        console.log(this.node);
        let item = JSON.parse(JSON.stringify(this.node)); // clone it
        delete item.quorumSet;
        delete item.geoData;
        delete item.statistics;
        item = Object.assign(item, this.node.geoData);
        item = Object.assign(item, this.node.statistics);
        item.quorumSet = '';

        return [item];
    }

    get latestCrawlDateString() {
        return this.network.latestCrawlDate ? this.network.latestCrawlDate.toLocaleString() : 'NA';
    }
}
</script>

<style scoped>
    .table {
        word-break: break-all;
    }
</style>