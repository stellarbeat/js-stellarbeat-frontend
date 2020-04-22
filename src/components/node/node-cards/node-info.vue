<template>
    <div class="card">
        <div class="card-header">
            <h1 class="card-title"><b-icon-shield v-b-tooltip.hover v-if="node.isFullValidator" title="Full validator"
                                                  class="rounded bg-success" variant="light"/>
                {{node.displayName}}
                <b-badge v-show="network.isNodeFailing(node)" variant="danger">Failing</b-badge>
            </h1>
        </div>
        <b-alert class="card-alert" :show="this.node.historyUrl && !this.node.isFullValidator" variant="warning">
            <b-icon-exclamation-triangle/> History archive not up-to-date
        </b-alert>
        <div class="card-body py-0">
            <table class="table card-table">
                <tbody>
                <tr class="text-gray ">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Public key</td>
                    <td class="px-0 text-right">{{node.publicKey.substr(0, 7)}}...{{node.publicKey.substr(51, 100)}}
                        <b-button size="sm" v-b-tooltip:hover.top="'Copy to clipboard'" v-clipboard:copy="node.publicKey">
                            <b-icon-clipboard />
                        </b-button>
                    </td>
                </tr>
                <tr class="text-gray" v-if="node.key">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">ip:port</td>
                    <td class="px-0 text-right">{{node.key}}</td>
                </tr>
                <tr class="text-gray" v-if="node.geoData.countryName">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Country</td>
                    <td class="px-0 text-right">{{node.geoData.countryName}}</td>
                </tr>
                <tr class="text-gray" v-if="node.isp">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">ISP</td>
                    <td class="px-0 text-right">{{node.isp}}</td>
                </tr>
                <tr class="text-gray" v-if="node.dateDiscovered">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Discovery date</td>
                    <td class="px-0 text-right" >{{node.dateDiscovered.toDateString()}}</td>
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
    export default class NodeInfo extends Vue {
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
