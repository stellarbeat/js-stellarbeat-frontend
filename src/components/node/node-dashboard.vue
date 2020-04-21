<template>
    <div>
        <div class="row row-cards row-deck">
            <div class="col-md-12 col-lg-6 col-xl-4">
                <node-profile :node="selectedNode"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <node-statistics-24-hours :node="selectedNode"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <node-info :node="selectedNode"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <history-card
                        :subject="'Validating'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                        :dayMeasurementProperty="'isValidatingCount'"
                        :measurementProperty="'isValidating'"
                        :chartType="'bar'"
                >
                </history-card>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <history-card
                        :subject="'Full validator'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                        :dayMeasurementProperty="'isFullValidatorCount'"
                        :measurementProperty="'isFullValidator'"
                >
                </history-card>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <history-card
                        :subject="'Overloaded'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                        :dayMeasurementProperty="'isOverloadedCount'"
                        :measurementProperty="'isOverLoaded'"
                        :inverted="true"
                >
                </history-card>
            </div>
            <div v-if="selectedNode.homeDomain" class="col-md-12 col-lg-6 col-xl-8">
                <node-toml-info :node="selectedNode"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <node-core-info :node="selectedNode"/>
            </div>
            <div class="col-12" v-if="selectedNode.isValidator">
                <node-quorum-set-validators :node="selectedNode"/>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import HistoryCard from '@/components/charts/history-card.vue';
    import {PublicKey} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import NodeProfile from '@/components/node/node-cards/node-profile.vue';
    import NodeStatistics24Hours from '@/components/node/node-cards/node-statistics-24-hours.vue';
    import NodeCoreInfo from '@/components/node/node-cards/node-core-info.vue';
    import NodeInfo from '@/components/node/node-cards/node-info.vue';
    import NodeTomlInfo from '@/components/node/node-cards/node-toml-info.vue';
    import NodeQuorumSetValidators from '@/components/node/node-cards/node-quorum-set-validators.vue';

    @Component({
        components: {
            NodeQuorumSetValidators,
            NodeTomlInfo, NodeInfo, NodeCoreInfo, NodeStatistics24Hours, NodeProfile, HistoryCard}
    })

    export default class NodeDashboard extends Vue {
        protected showHaltingAnalysis: boolean = false;
        protected haltingAnalysisPublicKey: PublicKey | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }
    }
</script>
<style scoped>

</style>