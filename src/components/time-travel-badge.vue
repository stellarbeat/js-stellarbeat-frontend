<template>
    <span v-if="store.isTimeTravel" class="tag">Time Travel
        <a href="#"
           v-on:click.stop.prevent="resetTimeTravel()"
           class="tag-addon"><b-icon-x/>
        </a>
    </span>
</template>
<script lang="ts">
    import Store from '@/store/Store';

    export default {
        name: 'time-travel-badge',
        computed: {
            store():Store {
                return (this as any).$root.$data.store;
            }
        },
        methods: {
            async resetTimeTravel() {
                (this as any).$root.$data.store.isLoading = true;
                await (this as any).$root.$data.store.fetchData();
                (this as any).$root.$data.store.isLoading = false;
            }
        }
    };
</script>
<style scoped>

    .tag-close-btn {
        text-decoration: none;
    }
</style>