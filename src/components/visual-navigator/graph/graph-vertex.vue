<template>
    <g :transform="coordinateTransform">
        <defs>
            <filter x="0" y="0" width="1" height="1" id="solid">
                <feFlood flood-color="white" flood-opacity="0.8"/>
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
import {Component, Prop} from 'vue-property-decorator';

@Component({})
export default class GraphNode extends Vue {
    public name: string = 'graph-vertex';

    @Prop()
    public publicKey!: string;
    @Prop()
    public selected!: boolean;
    @Prop()
    public highlightAsOutgoing!: boolean;
    @Prop()
    public highlightAsIncoming!: boolean;
    @Prop()
    public partOfTransitiveQuorumSet!: boolean;
    @Prop()
    public x!: number;
    @Prop()
    public y!: number;
    @Prop()
    public isValidating!: boolean;
    @Prop()
    public label!: string;

    get circleRadius(): string {
        return this.partOfTransitiveQuorumSet ? '3px' : '3px';
    }

    get coordinateTransform(): string {
        return `translate(${this.x},${this.y})`;
    }

    get classObject() {
        return {
            active: this.isValidating,
            selected: this.selected,
            failing: !this.isValidating,
            target: this.highlightAsIncoming,
            source : this.highlightAsOutgoing,
            transitive: this.partOfTransitiveQuorumSet
        };
    }
    get displayName(): string {
        return this.label;
    }

    public nodeSelected() {
        this.$router.push(
            {
                name: 'quorum-monitor-node',
                params: {publicKey: this.publicKey},
                query: {'center': '0', 'no-scroll': '1'},
            },
            );
    }
}
</script>

<style scoped>
    circle.active {
        fill: #1997c6;
    }

    circle.transitive {
        fill: #1997c6;
    }

    circle.selected {
        stroke:  yellow;
    }

    circle.failing {
        fill: #cd201f
    }

    circle.target {
        stroke:  #fec601;
        stroke-opacity: 1;
    }

    circle.source {
        stroke:  #73bfb8;
        stroke-opacity: 1;
    }

    circle {
        stroke: white;
        fill: #ECEBE4;
        cursor: pointer;
        stroke-width: 1px;
    }
    text{
        fill: #2364aa;
    }
</style>