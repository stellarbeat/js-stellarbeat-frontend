<template>
    <div>
        <transition
                name="fade"
                mode="out-in"
        >
        </transition>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import Store from '@/store/Store';
    import StellarCoreConfigurationGenerator
        from '@stellarbeat/js-stellar-domain/lib/stellar-core-configuration-generator';

    @Component({
        components: {
        }
    })
    export default class OrganizationSideBar extends Vue {
        protected includeWatcherNodes: boolean = false;

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.selectedNode;
        }

        get centerNode() {
            return this.store.centerNode;
        }

        get network() {
            return this.store.network;
        }
    }
</script>
<style scoped>
</style>