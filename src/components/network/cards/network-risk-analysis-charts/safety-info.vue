<template>
    <div>

        <h3>What does this chart show?</h3>
        <p class="my-4">The network is scanned for sets of
            nodes that contains intersections of one or more quorum pairs (network splitting sets). The chart shows the
            smallest sizes of
            these sets and, if available, the minimum and maximum for each time window.</p>
        <h3>What does it mean?</h3>
        <p class="my-4">
            If all nodes in a network splitting set are malicious, they can cause the network to diverge and split. For
            example, if the chart indicates the
            minimum size is 3, then 3 specific nodes would have to maliciously cooperate to cause the network to lose
            safety. To find out what these
            specific nodes are, you can time travel to that point in time, and run the network analysis tool (left
            sidebar > tools).<br/><br/>
            If a splitting set of size zero is found, this means that there is no intersection between some quorums.
            This could cause the network to split if the quorums agree on different values.
            To solve this the configurations of the validator nodes causing the loss of quorum intersection have to be
            changed.
        </p>
        <h3>Limitations of the analysis</h3>
        <p class="my-4">
            TODO: what if the network contains multiple fbas?
        </p>
        <h3>More information</h3>
        <p class="my-4">
            If you want to learn more about network splitting sets, check out the following
            <a target="_blank" href="https://arxiv.org/pdf/2002.08101.pdf">white paper</a>,
            more specific the section regarding minimal splitting sets.
        </p>
    </div>
</template>

<script lang="ts">
    import {Component, Mixins} from 'vue-property-decorator';
    import {StoreMixin} from '@/mixins/StoreMixin';

    @Component({
        components: {},
        directives: {}
    })
    export default class SafetyInfo extends Mixins(StoreMixin) {
    }
</script>

<style scoped>
</style>