<template>
    <div class="card">
        <div class="card-header">
            <h5 class="card-title">
                Validating statistics
            </h5>
        </div>
        <div class="card-body">
            <uptime-chart :title="'24H validating'"></uptime-chart>
            <uptime-chart :title="'30D validating'"></uptime-chart>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import UptimeChart from '@/components/quorum-monitor/statistics/uptime-chart.vue';
    import FullValidatorTitle from '@/components/node/full-validator-title.vue';
    import Store from "@/Store";

    @Component({
        name: "statistics-card",
        components: {FullValidatorTitle, UptimeChart}
    })
    export default class StatisticsCard extends Vue {
        get store():Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }
    }
</script>
<style scoped>
    .measure-point-green {
        fill: #5eba00;
    }

    .measure-point-warning {
        fill: #f1c40f;
    }

    .measure-point-danger {
        fill: #e9ecef;
    }

    .measure-point:hover {
        fill: darkgreen;
    }

    .total-percentage {
        color: #aaaaaa;
        font-size: small;
    }

    .spacer {
        flex: 1;
        margin: 0.65rem 1rem 0 0.5rem;
        height: 1px;
        background: #aaa;
        opacity: 0.3
    }
</style>