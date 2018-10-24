<template>
    <div>
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
</template>

<script>
    const Statistics = require("./statistics.vue");
    const NodesMap = require("./nodes-map.vue");
    const NodesCountryDistribution = require("./nodes-country-distribution.vue");

    export default {
        name: "home",
        props: {
            network: {
                type: Object
            }
        },
        components: {
            Statistics,
            NodesMap,
            NodesCountryDistribution
        }
    }
</script>

<style scoped>

</style>