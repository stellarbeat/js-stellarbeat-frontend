<template>
    <div class="card">
        <div class="card-header">
            <h1 class="card-title">Stellar Core info
            </h1>
        </div>

        <div class="card-body py-0">
            <table class="table card-table">
                <tbody>
                <tr class="text-gray " v-if="node.versionStr" v-b-popover.hover.top="node.versionStr">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Version</td>
                    <td class="px-0">{{node.versionStr | truncate(35)}}</td>
                </tr>
                <tr class="text-gray" v-if="node.overlayVersion">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Overlay version</td>
                    <td class="px-0">{{node.overlayVersion}}</td>
                </tr>
                <tr class="text-gray" v-if="node.overlayMinVersion">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Overlay min version</td>
                    <td class="px-0">{{node.overlayMinVersion}}</td>
                </tr>
                <tr class="text-gray" v-if="node.ledgerVersion">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Ledger version</td>
                    <td class="px-0">{{node.ledgerVersion}}</td>
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
    export default class NodeCoreInfo extends Vue {
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
