<template>
    <g :transform="coordinateTransform">
        <defs>
            <filter x="0" y="0" width="1" height="1" id="solid">
                <feFlood flood-color="white" flood-opacity="0.7"/>
                <feComposite in="SourceGraphic"/>
            </filter>
        </defs>
        <circle
                :r="circleRadius"
                v-bind:class="classObject"
                v-on:click="nodeSelected"
        ></circle>
        <text filter="url(#solid)" y="5" dy="1em" text-anchor="middle" font-size="5px">{{ displayName | truncate(10)}}</text>
    </g>
</template>

<script lang="ts">
import Vue from 'vue';
import {QuorumService, Node, Network} from '@stellarbeat/js-stellar-domain';
import {Component, Prop, Watch} from 'vue-property-decorator';

@Component({})
export default class GraphNode extends Vue {
    public name: string = 'graph-node';
    public circleRadius: string = '3px';

    @Prop()
    public node!: Node;
    @Prop()
    public network!: Network;
    @Prop()
    public selectedNode!: Node;
    @Prop()
    public sourceNodes!: Node[];
    @Prop()
    public targetNodes!: Node[];

    get coordinateTransform(): string {
        return `translate(${(this.node as any).x},${(this.node as any).y})`;
    }

    get failing(): boolean {
        return this.network.failingNodes.includes(this.node);
    }

    get selected(): boolean {
        return this.selectedNode === this.node;
    }

    get active(): boolean {
        return this.node.active;
    }

    get isTarget(): boolean {
        return this.targetNodes.includes(this.node) && this.selectedNode !== this.node;
    }

    get isSource(): boolean {
        return this.sourceNodes.includes(this.node) && this.selectedNode !== this.node;
    }

    get classObject() {
        return {
            active: this.active,
            selected: this.selected,
            failing: this.failing,
            target: this.isTarget,
            source : this.isSource,
        };
    }
    get displayName(): string {
        return this.node.displayName;
    }

    public nodeSelected() {
        this.$router.push(
            {
                name: 'quorum-monitor-node',
                params: {publicKey: this.node.publicKey},
                query: {'center': '0', 'no-scroll': '0'},
            },
            );
    }
}
</script>

<style scoped>
    circle.active {
        fill: #1997c6;
    }

    circle.selected {
        stroke:  yellow;
    }

    circle.failing {
        fill: red
    }

    circle.target {
        stroke:  #e4d836;

        stroke-opacity: 1;
    }

    circle.source {
        stroke:  #1bc98e;
        stroke-opacity: 0.7;
    }

    circle {
        stroke: white;
        fill: #ECEBE4;
        cursor: pointer;
        stroke-width: 1px;
    }
    text{
        fill: #1997c6;
    }
</style>