<template>
    <div class="action-bar ">
        <div class="btn-group btn-group-sm" role="group" aria-label="actions">

        <button type="button" class="btn btn-sm btn-icon btn-secondary" v-on:click.prevent.stop="$emit('node-show-modal', node)">
            <i class="fe fe-info"></i>
        </button>
        <button type="button" class="btn btn-sm btn-icon"
                v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
            <i class="fe fe-power"></i>
        </button>
        </div>
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
    .action-bar {
        float: right;
    }
</style>


