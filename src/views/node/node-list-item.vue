<template>
    <div>
        {{node.displayName | truncate(30)}}
        <span class="fa-pull-right">
            <button type="button" class="btn btn-sm"
                    v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                    v-bind:class="[node.active ? 'btn-success' : 'btn-secondary']">
                <font-awesome-icon size="xs" icon="power-off"/>
            </button>
            </span>

    </div>
</template>

<script>
    export default {
        name: "node-list-item",
        props: {
            nodePublicKey: {
                type: String
            },
            network: {
                type: Object
            }
        },
        data:
            function () {
                return {
                    node: this.network.getNodeByPublicKey(this.nodePublicKey)
                }
            }
    }
</script>

<style scoped>

</style>


