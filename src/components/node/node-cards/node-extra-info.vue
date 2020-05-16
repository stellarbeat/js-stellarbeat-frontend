<template>
    <div class="card">
        <div class="card-body py-0 d-flex justify-content-center align-items-center">
            <table class="table card-table">
                <tbody>
                <tr class="text-gray ">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Domain</td>
                    <td class="px-0 text-right">{{node.homeDomain ? node.homeDomain : 'N/A'}}</td>
                </tr>
                <tr class="text-gray">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Organization</td>
                    <td v-if="node.organizationId && network.getOrganizationById(node.organizationId)" class="px-0 text-right">
                        <router-link
                                :to="{ name: 'organization-dashboard', params: { 'organizationId': node.organizationId, 'view': $route.query.view }}">
                            {{network.getOrganizationById(node.organizationId).name}}
                        </router-link>
                    </td>
                    <td v-else class="px-0 text-right">
                        N/A
                    </td>

                </tr>
                <tr class="text-gray">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">History url</td>
                    <td class="px-0 flex-wrap text-right wrap-word">{{node.historyUrl ? node.historyUrl : 'N/A'}}</td>
                </tr>
                <tr class="text-gray" v-if="node.overlayVersion">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Overlay version</td>
                    <td class="px-0 text-right">{{node.overlayVersion}}</td>
                </tr>
                <tr class="text-gray" v-if="node.overlayMinVersion">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Overlay min version</td>
                    <td class="px-0 text-right">{{node.overlayMinVersion}}</td>
                </tr>
                <tr class="text-gray" v-if="node.ledgerVersion">
                    <td class="px-0" style="font-weight: 600;font-size: 0.875rem;">Ledger version</td>
                    <td class="px-0 text-right">{{node.ledgerVersion}}</td>
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

    @Component({
        components: {}
    })
    export default class NodeExtraInfo extends Vue {
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
