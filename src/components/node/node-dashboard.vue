<template>
    <div>
        <div class="row row-cards row-deck" v-if="showHaltingAnalysis" id="halting-analysis-card">
            <div class="col-12">
                <HaltingAnalysis
                        :network="network"
                        :publicKey="haltingAnalysisPublicKey"
                        v-on:update-validating-states="updateValidatingStates">
                </HaltingAnalysis>
            </div>
        </div>
        <div class="row row-cards row-deck">
            <div class="col-md-6 col-lg-4">
                <history-card
                        :subject="'Validating history'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                        :dayMeasurementProperty="'isValidatingCount'"
                        :measurementProperty="'isValidating'"
                        :chartType="'bar'"
                >
                </history-card>
            </div>
            <div class="col-md-6 col-lg-4">
                <history-card
                        :subject="'Full validator history'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                        :dayMeasurementProperty="'isFullValidatorCount'"
                        :measurementProperty="'isFullValidator'"
                >
                </history-card>
            </div>
            <div class="col-md-6 col-lg-4">
                <history-card
                        :subject="'Overloaded history'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayMeasurements(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getMeasurements(publicKey, from, to)"
                        :dayMeasurementProperty="'isOverloadedCount'"
                        :measurementProperty="'isOverLoaded'"
                        :inverted="true"
                >
                </history-card>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import HistoryCard from '@/components/node/node-cards/history-card.vue';
    import {PublicKey} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';

    @Component({
        components: {HistoryCard}
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

        onShowHaltingAnalysis(publicKey: PublicKey) {
            this.haltingAnalysisPublicKey = publicKey;
            this.showHaltingAnalysis = true;

            this.$nextTick(() => {
                this.$scrollTo('#halting-analysis-card');
            });
        }
    }
</script>
<style scoped>

</style>