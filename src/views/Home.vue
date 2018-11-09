<template>
    <div>
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>

        </div>
        <div v-if="!isLoading">
            <div class="page-header mt-2">
                <h1 class="page-title">
                    Stellar Network
                </h1>
                <div class="page-subtitle">Latest crawl on {{lastCrawlDateString}}</div>
            </div>
            <Statistics :network="network"></Statistics>

            <div class="row row-cards justify-content-center">
                <div class="col-xl-12 col-12">
                    <NodesMap :network="network"></NodesMap>
                </div>
            </div>
            <div class="row row-cards justify-content-center">
                <div class="col-xl-6 col-lg-6 col-12">
                    <QuorumSetConnections :network="network"></QuorumSetConnections>
                </div>
                <div class="col-xl-6 col-lg-6 col-12">
                    <NodesCountryDistribution :network="network"></NodesCountryDistribution>
                    <NodesVersions :network="network"></NodesVersions>

                </div>
                <div class="col-xl-6 col-lg-6 col-12">
                </div>

            </div>
        </div>
    </div>
</template>

<script>
    import Statistics from "@/components/statistics.vue";
    import NodesMap from "@/components/home/nodes-map.vue";
    import NodesCountryDistribution from "@/components/home/nodes-country-distribution.vue";
    import NodesVersions from "@/components/home/nodes-versions.vue";
    import QuorumSetConnections from "@/components/home/quorum-set-connections/quorum-set-connections.vue";

    export default {
        name: "home",
        props: {
            network: {
                type: Object
            },
            isLoading: {
                type: Boolean
            }
        },
        components: {
            Statistics,
            NodesMap,
            NodesCountryDistribution,
            NodesVersions,
            QuorumSetConnections
        },
        computed: {
            lastCrawlDateString: function () {
                return this.network.getLatestCrawlDate() ? this.network.getLatestCrawlDate().toLocaleString() : 'NA';
            }
        }
    }
</script>

<style>
    .progress-bar-striped {
        background-color: #1997c6;
        opacity: 0.6;
    }
</style>