<template>
    <div>
        <ul>
            <li>Click and drag on the Graph to pan</li>
            <li>Zoom the graph in or out with the controls in the bottom right corner.</li>
            <li>Select a node through search in the upper right corner, or by clicking on it in the graph.</li>
            <li>Click on "show legend" on the bottom of the graph to see the color codes for the nodes & connections.
            </li>
            <li>Links are only shown between validating nodes</li>
            <li>Strongly connected components have fuller links and are closer together in the graph.
            </li>
            <li>The transitive quorum set has a transparent blue background.
            </li>
            <li>Modify the network with the simulation options</li>
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


