<template>
    <div class="card">
        <div class="card-body py-0 d-flex flex-column justify-content-center">
            <h1 class="card-title mt-5 mb-4"><b-icon-shield v-b-tooltip.hover v-if="node.isFullValidator" title="Full validator"
                                                  class="rounded bg-success" variant="light"/>
                {{node.displayName}}
                <b-badge v-show="network.isNodeFailing(node)" variant="danger">Failing</b-badge>
            </h1>
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
                <tr class="text-gray">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">ip:port</td>
                    <td class="px-0 text-right">{{node.key}}</td>
                </tr>
                <tr class="text-gray " v-if="node.versionStr" v-b-tooltip:hover.top="node.versionStr">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Version</td>
                    <td class="px-0 text-right">{{node.versionStr | truncate(35)}}</td>
                </tr>
                <tr class="text-gray">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Country</td>
                    <td class="px-0 text-right">{{node.geoData.countryName ? node.geoData.countryName : 'N/A'}}</td>
                </tr>
                <tr class="text-gray">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">ISP</td>
                    <td class="px-0 text-right">{{node.isp ? node.isp : 'N/A'}}</td>
                </tr>
                <tr class="text-gray">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Discovery date</td>
                    <td class="px-0 text-right" >{{node.dateDiscovered.toDateString()}}</td>
                </tr>
                </tbody>
            </table>
        </div>
        <b-alert class="card-alert" :show="this.node.historyUrl && !this.node.isFullValidator" variant="warning">
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
    import {
        BAlert,
        BBadge,
        BButton,
        BIconClipboard,
        BIconExclamationTriangle,
        BIconShield,
        VBTooltip
    } from 'bootstrap-vue';

    @Component({
        components: {BIconExclamationTriangle: BIconExclamationTriangle, BAlert: BAlert, BBadge: BBadge, BIconClipboard: BIconClipboard, BButton:BButton, BIconShield: BIconShield},
        directives: {'b-tooltip': VBTooltip}
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
