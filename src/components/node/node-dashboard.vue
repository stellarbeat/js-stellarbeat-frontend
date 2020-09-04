<template>
    <div v-if="selectedNode">
        <div class="row row-cards row-deck">
            <div class="col-sm-12 col-md-6 col-xl-3">
                <node-index :node="selectedNode"/>
            </div>
            <div class="col-sm-12 col-md-6 col-xl-3" v-if="selectedNode.isValidator">
                <node-statistics-24-h-validating :node="selectedNode"/>
            </div>
            <div class="col-sm-12 col-md-6 col-xl-3" v-else>
                <node-statistics-24-h-active :node="selectedNode"/>
            </div>
            <div class="col-sm-12 col-md-6 col-xl-3" v-if="selectedNode.isValidator">
                <node-statistics-30-d-validating :node="selectedNode"/>
            </div>
            <div class="col-sm-12 col-md-6 col-xl-3" v-else>
                <node-statistics-30-d-active :node="selectedNode"/>
            </div>
            <div class="col-sm-12 col-md-6 col-xl-3">
                <node-statistics-30-d-overloaded :node="selectedNode"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4"  v-if="selectedNode.isValidator">
                <history-card
                        :subject="'Validating'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayStatistics(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getStatistics(publicKey, from, to)"
                        :dayMeasurementProperty="'isValidatingCount'"
                        :measurementProperty="'isValidating'"
                        :chartType="'bar'"
                >
                </history-card>
            </div>
            <div v-else class="col-md-12 col-lg-6 col-xl-4">
                <history-card
                        :subject="'Active'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayStatistics(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getStatistics(publicKey, from, to)"
                        :dayMeasurementProperty="'isActiveCount'"
                        :measurementProperty="'isActive'"
                        :chartType="'bar'"
                >
                </history-card>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4" v-if="selectedNode.isValidator">
                <history-card
                        :subject="'Full validator'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayStatistics(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getStatistics(publicKey, from, to)"
                        :dayMeasurementProperty="'isFullValidatorCount'"
                        :measurementProperty="'isFullValidator'"
                >
                </history-card>
            </div>


            <div class="col-md-12 col-lg-6 col-xl-4" v-if="selectedNode.isValidator">
                <history-card
                        :subject="'Overloaded'"
                        :entityId="selectedNode.publicKey"
                        :fetchDayMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getDayStatistics(publicKey, from, to)"
                        :fetchMeasurements="(publicKey, from, to) => store.nodeMeasurementStore.getStatistics(publicKey, from, to)"
                        :dayMeasurementProperty="'isOverloadedCount'"
                        :measurementProperty="'isOverLoaded'"
                        :inverted="true"
                >
                </history-card>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <node-info :node="selectedNode"/>
            </div>
            <div class="col-md-12 col-lg-6 col-xl-4">
                <node-extra-info :node="selectedNode"/>
            </div>

            <div v-if="selectedNode.isValidator" class="col-md-12 col-lg-6 col-xl-4">
                <node-trusted-by :node="selectedNode"/>
            </div>
        </div>
        <div class="row row-cards">
            <div class="col-lg-12 col-xl-8" v-if="selectedNode.isValidator">
                <node-quorum-set-validators :node="selectedNode"/>
            </div>
            <div class="col-lg-12 col-xl-4">
                <node-latest-updates :node="selectedNode"/>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import HistoryCard from '@/components/charts/history-card.vue';
    import Store from '@/store/Store';
    import NodeInfo from '@/components/node/node-cards/node-info.vue';
    import NodeExtraInfo from '@/components/node/node-cards/node-extra-info.vue';
    import NodeQuorumSetValidators from '@/components/node/node-cards/node-quorum-set-validators.vue';
    import NodeStatistics24HValidating
        from '@/components/node/node-cards/statistics/node-statistics-24H-validating.vue';
    import NodeStatistics24HActive from '@/components/node/node-cards/statistics/node-statistics-24H-active.vue';
    import NodeStatistics30DValidating
        from '@/components/node/node-cards/statistics/node-statistics-30D-validating.vue';
    import NodeStatistics30DOverloaded
        from '@/components/node/node-cards/statistics/node-statistics-30D-overloaded.vue';
    import NodeIndex from '@/components/node/node-cards/statistics/node-index.vue';
    import NodeStatistics30DActive from '@/components/node/node-cards/statistics/node-statistics-30D-active.vue';
    import NodeTrustedBy from '@/components/node/node-cards/node-trusted-by.vue';
    import NodeLatestUpdates from '@/components/node/node-cards/node-latest-updates.vue';

    @Component({
        components: {
            NodeLatestUpdates,
            NodeTrustedBy,
            NodeStatistics30DActive,
            NodeIndex,
            NodeStatistics30DOverloaded,
            NodeStatistics30DValidating,
            NodeStatistics24HActive,
            NodeStatistics24HValidating,
            NodeQuorumSetValidators,
            NodeExtraInfo, NodeInfo, HistoryCard}
    })

    export default class NodeDashboard extends Vue {

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