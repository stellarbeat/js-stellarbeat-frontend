<template>
    <div class="list-group list-group-flush">
        <div class="list-group-item"
           v-for="node in nodes">
            <div>
                {{node.displayName | truncate(30)}}
                <span class="fa-pull-right">
                    <NodeActionBar :nodePublicKey="node.publicKey" :network="network" v-on:node-toggle-active="toggleActive(node)"></NodeActionBar>
                </span>
            </div>
        </div>
    </div>
</template>

<script>
    const NodeActionBar = require('./node/node-action-bar.vue');

    export default {
        name: "node-list",
        components: {
            NodeActionBar,
        },
        props: {
            nodes: {
                type: Array
            },
            network: {
                type: Object
            }
        },
        methods: {
            toggleActive: function (node) {
                this.$emit("node-toggle-active", node);
            }
        }
    }
</script>

<style scoped>

</style>


