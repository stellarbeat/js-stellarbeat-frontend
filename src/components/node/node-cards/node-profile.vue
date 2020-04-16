<template>
    <div class="card card-profile">
        <div class="card-body d-flex flex-column justify-content-center">
            <div class="text-center">
                <h3 class="mb-1">
                    <b-icon-shield v-b-tooltip.hover v-if="node.isFullValidator" title="Full validator"
                                   class="border border-success bg-success rounded" variant="light"/>
                    {{node.displayName}}
                </h3>
                <h4 class="card-subtitle mt-0">
                    {{node.publicKey.substr(0, 20)}}...{{node.publicKey.substr(50, 100)}}
                </h4>
            </div>
            <div class="d-flex flex-row flex-wrap justify-content-center">
                    <gauge width="100px" height="100px"
                           :value="node.index" :max-value="1" title="Index"
                           :centerText="+node.index.toFixed(2)"/>
                    <!--gauge value-color="#5eba00" negative-value-color="#cd201f" width="150px" height="100px" :value="node.statistics.validating24HoursPercentage" :max-value="100" title="24H Validating"
                           :center-text="+node.statistics.validating24HoursPercentage.toFixed(2) + '%'"
                           /!-->
            </div>
            <b-alert :show="this.node.historyUrl && !this.node.isFullValidator" variant="warning">
                <b-icon-exclamation-triangle/> History archive not up-to-date
            </b-alert>
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
    export default class NodeProfile extends Vue {
        @Prop()
        protected node!: Node;
        public chart: Chart | null = null;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }
    };
</script>

<style scoped>
    li {
        margin-bottom: 5px;
    }

    .title {
        font-size: 24px;
        line-height: 1.2;
        font-weight: 400;
    }

    .public-key {

    }

    .type {
        font-size: 16px;
        color: #9aa0ac;
    }

    .profile-list {
        list-style: none;
    }

    .social-link {
        text-decoration: none;
    }

    .chart-container {
        height: 70px;
        width: 140px;
    }
</style>
