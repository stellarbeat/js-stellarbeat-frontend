<template>
    <div class="card card-profile">


        <div class="card-body d-flex flex-column justify-content-around p-4">
            <div class="text-center">
                <h3 class="mb-1">
                    <b-icon-shield v-b-tooltip.hover v-if="node.isFullValidator" title="Full validator"
                                   class="rounded bg-success" variant="light"/>
                    {{node.displayName}}
                    <b-badge v-show="network.isNodeFailing(node)" variant="danger">Failing</b-badge>
                </h3>
            </div>
            <div class="d-flex flex-row flex-wrap justify-content-center">
                    <gauge width="120px" height="120px"
                           :value="node.index" :max-value="1" title="Node index"
                           :centerText="+node.index.toFixed(2)"/>
            </div>
        </div>
        <b-alert :show="this.node.historyUrl && !this.node.isFullValidator" variant="warning" class="mb-0">
            <b-icon-exclamation-triangle/> History archive not up-to-date
        </b-alert>
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
    export default class NodeProfile extends Vue {
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

</style>
