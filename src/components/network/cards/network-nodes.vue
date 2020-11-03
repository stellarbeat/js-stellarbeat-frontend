<template>
    <div class="card">
        <div class="card-header pl-3">
            <h1 class="card-title"><b-badge variant="success">{{numberOfActiveNodes}}</b-badge> active {{store.includeWatcherNodes ? 'nodes' : 'validators'}}</h1>
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
    export default class NetworkNodes extends Vue{
        @Prop()
        node!: Node;

        protected filter:string="";

        get fields(): any {
            if(this.store.isSimulation){
                return [{key: 'name', label: 'Node', sortable: true}];
            } else {
                return [
                    {key: 'name', label: 'Node', sortable: true},
                    {key: 'index', label: 'Index', sortable: true},
                ];
            }
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get numberOfActiveNodes() {
            if(this.store.includeWatcherNodes)
                return this.network.nodes.filter((node) => !this.network.isNodeFailing(node)).length;
            else
                return this.network.nodes.filter((node) => node.isValidator && !this.network.isNodeFailing(node)).length;
        }

        get validators() {
            return this.network.nodes.filter(node => node.isValidator || this.store.includeWatcherNodes)
                .map(node => {
                    return {
                        isFullValidator: node.isFullValidator,
                        name: node.displayName,
                        index: node.index,
                        publicKey: node.publicKey
                    }
                })
        }
    }
</script>