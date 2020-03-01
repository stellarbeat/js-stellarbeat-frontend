<template>
    <router-link active-class="active" class="nav-link my-nav-link d-flex justify-content-between" :to="{ name: 'quorum-monitor-node', params: { publicKey: node.publicKey}, query: { 'no-scroll': '1' }}">
        <span class="nav-link-title">{{node.displayName | truncate(26)}}</span>
        <span
                v-if="!node.isFullValidator" class="nav-link-icon mr-3">
               <alert-triangle-icon size="1x" :style="alertStyle" class=""
                                    v-b-popover.hover.top="alert">
               </alert-triangle-icon>
        </span>
    </router-link>
</template>
<script lang="ts">
    import {Network, Node} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {AlertTriangleIcon} from 'vue-feather-icons';

    @Component({
        name: 'nav-link-validator',
        components: {AlertTriangleIcon},
    })
    export default class NavLinkValidator extends Vue {
        @Prop()
        protected node!: Node;

        get store(): Store {
            return this.$root.$data.store;
        }

        get isFailing() {
            return this.network.isNodeFailing(this.node);
        }

        get hasAlert(){
            return this.isFailing || !this.node.isFullValidator;
        }

        get alertStyle() {
            return {
                color: this.isFailing ? 'red' : 'orange'
            }
        }

        get alert() {
            if(this.isFailing)
                return 'Node failing';
            else
                return 'Not a full validator';
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get network(): Network {
            return this.$root.$data.store.network;
        }
    };
</script>
<style scoped>

    .my-nav-link {
        padding-top: 6px !important;
        padding-bottom: 6px !important;
        height: 22px !important;
    }

</style>