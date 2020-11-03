<template>
    <div class="card">
        <div class="card-header">
            <h1 class="card-title">Trusts <b-badge variant="success">{{validators.length}}</b-badge> nodes</h1>
            <div class="card-options">
                <form>
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm" placeholder="Search" name="s" v-model="filter">
                        <div class="input-icon-addon">
                            <b-icon-search/>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        <nodes-table :filter="filter" :nodes="validators" :fields="fields" per-page="5"/>
    </div>
</template>
<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import Vue from 'vue';
    import {Network, Node, Organization, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import NodesTable from '@/components/node/nodes-table.vue';
    import {BBadge, BIconSearch} from 'bootstrap-vue';

    @Component({
        components: {NodesTable, BIconSearch: BIconSearch, BBadge:BBadge}
    })
    export default class NodeQuorumSetValidators extends Vue{
        @Prop()
        node!: Node;

        protected filter:string="";

        get fields(): any {
            if(!this.store.isSimulation){
                return [
                    {key: 'name', label: 'Quorumset validator', sortable: true},
                    {key: 'index', label: 'index', sortable: true},
                    {key: 'validating24Hour', label: '24H validating', sortable: true},
                    {key: 'validating30Days', label: '30D validating', sortable: true},
                    {key: 'version', label: 'version', sortable: true},
                    {key: 'country', label: 'country', sortable: true},
                    {key: 'isp', label: 'isp', sortable: true}
                ];
            } else {
                return [{key: 'name', label: 'Quorumset validator', sortable: true}];
            }

        }

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