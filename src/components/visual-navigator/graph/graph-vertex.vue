<template>
    <g :transform="coordinateTransform" style="cursor: pointer;" v-on:click="nodeSelected">
        <circle
                :r="circleRadius"
                v-bind:class="classObject"
        >
          <title>{{ displayName }}</title>
        </circle>
        <g>
        <rect style="fill: white; opacity: 0.7; text-transform: lowercase" :width="rectWidthPx" height="15px" y="9" :x="rectX" rx="2" :class="{'rect-selected': selected, 'rect': !selected}"/>
        <text y="5" :class="textClass" dy="1.3em" text-anchor="middle" font-size="12px">{{ displayName | truncate(10)}}</text>
        </g>
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
    public isFailing!: boolean;
    @Prop()
    public label!: string;

    get circleRadius(): string {
        return this.partOfTransitiveQuorumSet ? '5px' : '5px';
    }

    get coordinateTransform(): string {
        return `translate(${this.x},${this.y})`;
    }

    get rectWidth() {
        return (this.$options!.filters!.truncate(this.displayName,10).length/10) * 70;
    }
    get rectWidthPx() {
        return this.rectWidth + 'px';
    }

    get rectX() {
        return '-' + this.rectWidth / 2 + 'px';
    }

    get textClass() {
      return {
        active: !this.isFailing,
        failing: this.isFailing
      }
    }
    get classObject() {
        return {
            active: !this.isFailing,
            selected: this.selected,
            failing: this.isFailing,
            target: this.highlightAsIncoming && !this.selected,
            source : this.highlightAsOutgoing && !this.selected,
            transitive: this.partOfTransitiveQuorumSet
        };
    }
    get displayName(): string {
        return this.label;
    }

    public nodeSelected() {
        if(this.$route.params.publicKey && this.$route.params.publicKey === this.publicKey)
            return;

        this.$router.push(
            {
                name: 'node-dashboard',
                params: {publicKey: this.publicKey},
                query: {'center': '0', 'no-scroll': '1', 'view': this.$route.query.view, 'network': this.$route.query.network},
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
        opacity: 0.7;
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
        stroke-width: 1.5px;
    }
    text{
        fill: #1997c6;
        font-weight: 400;
    }

    .failing {
      fill: #cd201f;
      opacity: 0.7;
    }

    .rect {
        opacity: 0.8;
    }
    .rect-selected {
        stroke: yellow;
        stroke-width: 1.5;
    }
</style>