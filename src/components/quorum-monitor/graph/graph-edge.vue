<template>
    <path
            v-bind:class="classObject"
            v-bind:d="path"
    />
</template>

<script lang="ts">
import {Component, Prop} from 'vue-property-decorator';
import Vue from 'vue';

@Component({})
export default class GraphLink extends Vue {
    public name: string = 'graph-edge';
    @Prop()
    public highlightAsOutgoing!: boolean;
    @Prop()
    public highlightAsIncoming!: boolean;
    @Prop()
    public isPartOfStronglyConnectedComponent!: boolean;
    @Prop()
    public parentX!: boolean;
    @Prop()
    public parentY!: boolean;
    @Prop()
    public childX!: boolean;
    @Prop()
    public childY!: boolean;
    @Prop()
    public isFailing!: boolean;
    @Prop()
    public hideRegular!: boolean;

    get path() {
        return 'M' +
            this.parentX + ' ' +
            this.parentY + ' L' +
            this.childX + ' ' +
            this.childY;
    }

    get classObject() {
        return {
            'outgoing': this.highlightAsOutgoing,
            'incoming': this.highlightAsIncoming,
            'strongly-connected': this.isPartOfStronglyConnectedComponent,
            'failing': this.isFailing,
            'hide-regular': this.hideRegular
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

    path.hide-regular {
        stroke: white;
    }

    path.failing {
        stroke: #cd201f;
    }

    path.outgoing {
        stroke: #fec601;
        stroke-opacity: 1;
        stroke-width: 1px;
    }

    path.incoming {
        stroke: #73bfb8;
        stroke-opacity: 1;
        stroke-width: 1px;
    }
</style>