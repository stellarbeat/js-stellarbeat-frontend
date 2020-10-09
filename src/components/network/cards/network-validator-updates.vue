<template>
    <div class="card">
        <div class="card-header p-3">
            <h1 class="card-title">Latest updated validators</h1>
        </div>
        <div v-if="failed" class="card-alert alert alert-danger mb-0">
            <b-icon-exclamation-triangle/>
            Error fetching data
        </div>
        <div v-bind:class="dimmerClass">
            <div class="loader mt-2"></div>
            <div class="dimmer-content">
                <b-list-group v-if="!isLoading" flush class="w-100 mb-4  card-columns">
                    <b-list-group-item v-for="snapshot in snapshots" :key="snapshot.node.publicKey" class="px-3 py-2">
                        <div class="text-muted mb-0" style="font-size: small">{{snapshot.startDate.toLocaleString()}}
                            <b-badge v-if="snapshot.startDate.getTime() === network.crawlDate.getTime()" variant="info">current crawl</b-badge>
                        </div>
                        <div class="d-flex align-items-center ml-2">
                            <div class="mr-1">
                                <router-link
                                        :to="{ name: 'node-dashboard', params: { publicKey: snapshot.node.publicKey }}">
                                    {{snapshot.node.displayName}}
                                </router-link>
                            </div>
                            <b-badge v-if="snapshot.startDate.getTime() === snapshot.node.dateDiscovered.getTime()" variant="success">New</b-badge>
                        </div>
                    </b-list-group-item>
                </b-list-group>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    import {Component, Mixins} from 'vue-property-decorator';
    import NodesTable from '@/components/node/nodes-table.vue';
    import {BBadge, BIconSearch, BTable, BIconExclamationTriangle, BListGroup, BListGroupItem} from 'bootstrap-vue';
    import {StoreMixin} from '@/mixins/StoreMixin';
    import AsyncComputed from 'vue-async-computed-decorator';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import {NodeSnapShot} from '@stellarbeat/js-stellar-domain/lib/node-snap-shot';

    @Component({
        components: {
            NodesTable,
            BIconSearch: BIconSearch,
            BBadge: BBadge,
            BTable,
            BIconExclamationTriangle,
            BListGroup,
            BListGroupItem
        }
    })
    export default class NetworkValidatorUpdates extends Mixins(StoreMixin, IsLoadingMixin) {
        failed: boolean = false;

        @AsyncComputed()
        async snapshots() {
            let snapshots: NodeSnapShot[] = [];
            try {
                snapshots = await this.store.fetchNodeSnapshots();
            } catch (e) {
                console.log(e);
                this.failed = true;
            }
            this.isLoading = false;
            return snapshots;
        }
    }
</script>
<style scoped>
    .card-columns {
        column-count: 3;
    }
</style>