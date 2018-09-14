<template>
    <div class="list-group list-group-flush">
        <a href="#" class="list-group-item list-group-item-action"
           v-for="node in nodes">
            {{node.displayName | truncate(30)}}
            <span class="fa-pull-right">
                <button type="button" class="btn btn-sm"
                        v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                        v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
                <font-awesome-icon size="xs" icon="power-off"/>
            </button>
            </span>
        </a>
    </div>
</template>

<script>
    export default {
        name: "node-list",
        props: {
            nodes: {
                type: Array
            }
        },
    }
</script>

<style scoped>

</style>


