<template>
    <div class="card">
        <div class="card-body d-flex flex-row flex-wrap align-items-center p-3">
            <gauge width="45px" height="45px"
                   :value="node.statistics.active24HoursPercentage" :max-value="100"
                   value-color="#5eba00" negative-value-color="#cd201f"
            class="mr-3"/>
            <div class="lh-sm">
                <div class="strong"> {{+node.statistics.active24HoursPercentage.toFixed(2)}}%</div>
                <div class="text-muted">24H Active</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import Vue from 'vue';
    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import Chart from 'chart.js';
    import Gauge from '@/components/charts/gauge.vue';

    @Component({
        components: {Gauge}
    })
    export default class NodeStatistics24HActive extends Vue {
        @Prop()
        protected node!: Node;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }
    };
</script>

<style scoped>
.strong {
    font-weight: 500;
}
.text-muted {
    color: #6e7582 !important;
}
</style>
