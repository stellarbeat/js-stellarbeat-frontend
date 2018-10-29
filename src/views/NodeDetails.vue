<template>
    <div>
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>

        </div>
        <div v-else>
            <div class="page-header">
                <h1 class="page-title">
                    Node info
                </h1>
                <div class="page-subtitle">Last crawl on TODO UTC</div>
            </div>
            <b-card class="mb-2 p-3">
                <b-table stacked striped hover responsive :items="items" >
                    <template slot="quorumSet" slot-scope="row">
                        <router-link class="btn btn-secondary btn-sm" role="button" :to="{ name: 'quorum-monitor-node', params: { publicKey: row.item.publicKey }}">Go to quorum monitor</router-link>
                    </template>
                </b-table>
            </b-card>
        </div>
    </div>
</template>

<script>
    export default {
        name: "node-details",
        props: {
            network: {
                type: Object
            },
            isLoading: {
                type: Boolean
            }
        },
        computed: {
            node: function() {
                return this.network.getNodeByPublicKey(this.$route.params.publicKey)
            },
            items: function() {
                if(!this.node) {
                    return [];
                }
                let item = JSON.parse(JSON.stringify(this.node)); //clone it
                delete item.quorumSet;
                delete item.geoData;
                delete item.statistics;
                item = Object.assign(item, this.node.geoData);
                item = Object.assign(item, this.node.statistics);
                item.quorumSet = '';
                return [item];
            }
        },
    }
</script>

<style>
    .progress-bar-striped {
        background-color: #1997c6;
        opacity: 0.6;
    }
</style>