<template>
    <span v-if="store.isSimulation" class="tag">Simulation
        <a href="#"
           v-on:click.stop.prevent="store.resetUpdates()"
           class="tag-addon"><b-icon-x/>
        </a>
    </span>
</template>
<script lang="ts">
    import Store from '@/store/Store';

    export default {
        name: 'simulation-badge',
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