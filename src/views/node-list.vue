<template>
    <div class="list-group list-group-flush">
        <div class="list-group-item"
           v-for="node in nodes">
            <NodeListItem :nodePublicKey="node.publicKey" :network="network" v-on:node-toggle-active="toggleActive(node)"></NodeListItem>
        </div>
    </div>
</template>

<script>
    const NodeListItem = require('./node/node-list-item.vue');

    export default {
        name: "node-list",
        components: {
            NodeListItem,
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


