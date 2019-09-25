<template>
    <div class="pt-0">
        <div class="pt-2 pb-3 nodes-title active" v-on:click="toggleShow">
            <i class="chevron fe mr-1" v-bind:class="chevron"></i>
            <h5 class="mb-0">Validating Statistics
            </h5>
        </div>
        <div v-if="showing" class="list-group list-group-flush nested-tree">
            <div class="list-group-item p-1 pr-0 node-list">
            <uptime-chart :title="'24H validating'"></uptime-chart>
            </div>
            <div class="list-group-item p-1 pr-0 node-list">
            <uptime-chart :title="'30D validating'"></uptime-chart>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Network, Node} from "@stellarbeat/js-stellar-domain";
    import UptimeChart from '@/components/quorum-monitor/statistics/uptime-chart.vue';

    @Component({
        name: "node-statistics-list-item",
        components: {UptimeChart},
    })
    export default class NodeStatisticsListItem extends Vue {
        @Prop()
        public node!: Node[];
        @Prop()
        public network!: Network;

        protected showing: boolean = true;

        get chevron(): string { //todo should be moved to higher up component & code reuse
            return this.showing ? "fe-chevron-down" : "fe-chevron-right";
        }

        toggleShow(): void {
            this.showing = !this.showing;
        }
    }
</script>

<style scoped>
    .node-list {
        width: 100%;
        border: none;
    }

    .active {
        color: #1997c6
    }

    a:hover, a:visited, a:link, a:active {
        text-decoration: none;
    }

    a:hover {
        background-color: #f8f9fa;
    }

    .chevron {
        float: left;
    }

    .nodes-title {
        cursor: pointer;
    }

    .nodes-title:hover {
        background-color: #f8f9fa;
    }

</style>


