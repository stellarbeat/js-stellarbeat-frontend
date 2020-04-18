<template>
    <div class="card">
        <div class="card-header">
            <h1 class="card-title">Node TOML info
            </h1>
        </div>

        <div class="card-body py-0">
            <table class="table card-table">
                <tbody>
                <tr class="text-gray " v-if="node.homeDomain">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Domain</td>
                    <td class="px-0 text-right">{{node.homeDomain}}</td>
                </tr>
                <tr class="text-gray" v-if="node.organizationId">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Organization</td>
                    <td class="px-0 text-right">{{network.getOrganizationById(node.organizationId).name}}</td>
                </tr>
                <tr class="text-gray" v-if="node.historyUrl">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">History url</td>
                    <td class="px-0 flex-wrap text-right wrap-word">{{node.historyUrl}}</td>
                </tr>
                <tr class="text-gray" v-if="node.alias">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Alias</td>
                    <td class="px-0 text-right">{{node.alias}}</td>
                </tr>
                </tbody>
            </table>
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
        components: {}
    })
    export default class NodeTomlInfo extends Vue {
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
.wrap-word {
    overflow-wrap: break-word;
    max-width: 20px;
}
</style>
