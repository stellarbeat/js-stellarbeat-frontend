<template>
    <div style="font-size: 0.5rem;">
        <button type="button" class="btn btn-xs btn-secondary" v-on:click.prevent.stop="$emit('node-show-modal', node)">
            <font-awesome-icon size="xs" icon="info"/>
        </button>
        <button type="button" class="btn btn-xs"
                v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
            <font-awesome-icon size="xs" icon="power-off"/>
        </button>
    </div>

</template>

<script>
    export default {
        name: "node-action-bar",
        props: {
            node: {
                type: Object
            }
        }
    }
</script>

<style scoped>
    .btn-group-xs > .btn, .btn-xs {
        padding  : .25rem .25rem;
        font-size  : .875rem;
        line-height  : .5;
        border-radius : .2rem;
    }
</style>


