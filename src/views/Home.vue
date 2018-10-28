<template>
    <div>
        <div v-if="isLoading" class="row">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>

        </div>
        <div v-if="!isLoading">
            <div class="page-header">
                <h1 class="page-title">
                    Stellar network
                </h1>
                <div class="page-subtitle">Last crawl on TODO UTC</div>
            </div>
            <Statistics :network="network"></Statistics>

            <div class="row row-cards justify-content-center">
                <div class="col-lg-12 col-12">
                    <NodesMap :network="network"></NodesMap>
                </div>
            </div>
            <div class="row row-cards justify-content-center">
                <div class="col-lg-12 col-12">
                    <NodesCountryDistribution :network="network"></NodesCountryDistribution>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Statistics from "@/components/statistics.vue";
    import NodesMap from "@/components/nodes-map.vue";
    import NodesCountryDistribution from "@/components/nodes-country-distribution.vue";

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
            NodesCountryDistribution
        }
    }
</script>

<style>
    .progress-bar-striped {
        background-color: #1997c6;
        opacity: 0.6;
    }
</style>