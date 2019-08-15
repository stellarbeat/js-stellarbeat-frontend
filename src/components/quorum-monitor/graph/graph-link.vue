<template>
    <path
            v-bind:class="classObject"
            v-bind:d="path"
    />
</template>

<script lang="ts">
import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';
import {Link, Node} from '@stellarbeat/js-stellar-domain'

@Component({})
export default class GraphLink extends Vue {
    public name: string = 'graph-link';
    @Prop()
    public link!: Link;
    @Prop()
    public selectedNode!: Node;

    get path() {
        return 'M' +
            (this.link.source as any).x + ' ' +
            (this.link.source as any).y + ' L' +
            (this.link.target as any).x + ' ' +
            (this.link.target as any).y;
    }

    get classObject() {
        return {
            'from-selected': this.link.source === this.selectedNode,
            'to-selected': this.link.target === this.selectedNode,
            'transitive-quorum-set': this.link.isPartOfTransitiveQuorumSet,
            'strongly-connected': this.link.isPartOfStronglyConnectedComponent, /*,
                'inactive': !this.link.originLink.active*/
        };
    }
}
</script>

<style scoped>
    path {
        stroke: #1997c6;
        stroke-width: 0.5px;
        stroke-opacity: 0.14;
        fill-opacity: 0;
    }

    path.strongly-connected {
        stroke: #1997c6;
        stroke-width:0.8px;
        stroke-opacity: 0.25;
    }

    path.transitive-quorum-set {
        stroke: #1997c6;
        stroke-width:0.8px;
        stroke-opacity: 0.25;
    }

    spath.strongly-connected {
        animation: nodepulse 1s ease-in-out infinite;
        fill: black;
    }

    @keyframes nodepulse {
        0% {
            stroke-width: 0.7;
        }
        100% {
            stroke-width: 1;
        }
    }
    path.from-selected {
        stroke: #fec601;
        stroke-opacity: 1;
        stroke-width: 1px;
    }


    path.to-selected {
        stroke: #73bfb8;
        stroke-opacity: 1;
        stroke-width: 1px;
    }
</style>