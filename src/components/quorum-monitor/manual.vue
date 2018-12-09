<template>
    <div>
        <ul>
            <li>Click and drag on the Graph to pan</li>
            <li>Zoom the graph in or out with the controls in the bottom right corner.</li>
            <li>Select a node through search in the upper right corner, or by clicking on it in the graph.</li>
            <li>Click on "show legend" on the bottom of the graph to see the color codes for the nodes & connections.
            </li>
            <li>Links are only shown between active, non-failing nodes</li>
            <li>Clustered nodes have fuller links and are closer together in the graph. A node is part of a cluster if
                it is connected to itself through the other nodes in the cluster.
            </li>
            <li>Press the info button in the selected node details for a complete list of the node details.</li>
            <li>
                Toggle the on/off button in the selected node details to activate/deactivate the node and see the
                effects on the network.
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'manual',
});
</script>

<style scoped>

</style>


