<template>
    <div class="card">
        <div class="card-header">
            <h1 class="card-title">Trusts <b-badge variant="success">{{validators.length}}</b-badge> nodes</h1>
        </div>
        <nodes-table :nodes="validators" :fields="fields" per-page="10"/>
    </div>
</template>
<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import Vue from 'vue';
    import {Network, Node, Organization, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import NodesTable from '@/components/node/nodes-table.vue';

    @Component({
        components: {NodesTable}
    })
    export default class NodeQuorumSetValidators extends Vue{
        @Prop()
        node!: Node;
        fields:any[] = [
            {key: 'name', label: 'Quorumset validator', sortable: true},
            {key: 'index', label: 'index', sortable: true},
            {key: 'validating24Hour', label: '24H validating', sortable: true},
            {key: 'validating30Days', label: '30D validating', sortable: true},
            {key: 'version', label: 'version', sortable: true},
            {key: 'country', label: 'country', sortable: true},
            {key: 'isp', label: 'isp', sortable: true}

        ];

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get validators() {
            return QuorumSet.getAllValidators(this.node.quorumSet)
                .map(publicKey => this.network.getNodeByPublicKey(publicKey)!)
                .map(validator => {
                    return {
                        isFullValidator: validator.isFullValidator,
                        name: validator.displayName,
                        version: validator.versionStr,
                        index: validator.index,
                        validating24Hour: validator.statistics.has24HourStats ? validator.statistics.validating24HoursPercentage + '%' : 'NA',
                        validating30Days: validator.statistics.has30DayStats ? validator.statistics.validating30DaysPercentage + '%' : 'NA',
                        country: validator.geoData.countryName,
                        isp: validator.isp,
                        publicKey: validator.publicKey
                    }
                })
        }
    }
</script>