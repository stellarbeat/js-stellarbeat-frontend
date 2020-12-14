<template>
    <span v-if="store.isSimulation" class="tag mx-2">Simulation mode
        <a href="#" v-if="!store.isLocalNetwork"
           v-on:click.stop.prevent="store.resetUpdates()"
           class="tag-addon"><b-icon-x/>
        </a>
    </span>
</template>
<script lang="ts">
    import Store from '@/store/Store';
    import {BIconX} from 'bootstrap-vue';

    export default {
        name: 'simulation-badge',
        components: {BIconX: BIconX},
        computed: {
            store():Store {
                return (this as any).$root.$data.store;
            }
        }
    };
</script>
<style scoped>

    .tag-close-btn {
        text-decoration: none;
    }
</style>