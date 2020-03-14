<template>
    <div class="row row-cards">

    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import NodesCountryDistribution from '@/components/network/cards/nodes-country-distribution.vue';
    import NodesVersions from '@/components/network/cards/nodes-versions.vue';
    import ValidatorsServerLoad from '@/components/network/cards/validator-load.vue';
    import QuorumSetConnections from '@/components/network/cards/quorum-set-connections/quorum-set-connections.vue';

    @Component({
        components: {QuorumSetConnections, ValidatorsServerLoad, NodesVersions, NodesCountryDistribution}
    })

    export default class OrganizationDashboard extends Vue {
    }
</script>
<style scoped>

</style>