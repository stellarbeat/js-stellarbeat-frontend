<template>
    <div>
        <div class="page-header">
            <h1 class="page-title">
                Node info
            </h1>
            <div class="page-subtitle">Last crawl on TODO UTC</div>
        </div>
        <b-card class="mb-2 p-3">
            <b-table stacked striped hover responsive :items="items" >
                <template slot="quorumSet" slot-scope="row">
                    <router-link class="btn btn-primary" role="button" :to="{ name: 'quorum-monitor-node', params: { publicKey: row.item.publicKey }}">Go to quorum monitor</router-link>
                </template>
            </b-table>
        </b-card>
    </div>

</template>

<script>
    export default {
        name: "node-info",
        data() {
            return {
                node: this.network.getNodeByPublicKey(this.$route.params.publicKey)
            }
        },
        props: {
            network: {
                type: Object
            }
        },
        computed: {
            items: function() {
                let item = JSON.parse(JSON.stringify(this.node)); //clone it
                delete item.quorumSet;
                delete item.geoData;
                delete item.statistics;
                item = Object.assign(item, this.node.geoData);
                item = Object.assign(item, this.node.statistics);
                item.quorumSet = '';
                return [item];
            }
        }
    }
</script>

<style>

</style>