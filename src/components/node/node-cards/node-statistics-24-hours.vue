<template>
    <div class="card">
        <div class="card-header">
            <h1 class="card-title">24H Statistics</h1>
        </div>

        <div class="card-body d-flex flex-row flex-wrap justify-content-around align-items-center p-4">
                    <gauge v-if="node.isValidator" width="100px" height="100px"
                           :value="node.statistics.validating24HoursPercentage" :max-value="100" title="24H Validating"
                           :centerText="+node.statistics.validating24HoursPercentage.toFixed(2) + '%'"
                    value-color="#5eba00" negative-value-color="#cd201f"/>
                <gauge v-else="node.isValidator" width="100px" height="100px"
                       :value="node.statistics.active24HoursPercentage" :max-value="100" title="24H Active"
                       :centerText="+node.statistics.active24HoursPercentage.toFixed(2) + '%'"
                       value-color="#5eba00" negative-value-color="#cd201f"/>
                <gauge width="100px" height="100px"
                       :value="node.statistics.overLoaded24HoursPercentage" :max-value="100" title="24H Overloaded"
                       :centerText="+node.statistics.overLoaded24HoursPercentage.toFixed(2) + '%'"
                       value-color="#cd201f" negative-value-color="#5eba00"/>
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
    export default class Statistics24Hours extends Vue {
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
