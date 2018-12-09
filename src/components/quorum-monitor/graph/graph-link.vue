<template>
    <path
            v-bind:class="classObject"
            v-bind:d="path"
    />
</template>

<script lang="ts">
import {Component, Prop, Watch} from 'vue-property-decorator';
import Vue from 'vue';

@Component({})
export default class GraphLink extends Vue {
    public name: string = 'graph-link';
    @Prop()
    public link!: {source: Node, target: Node, isClusterLink: boolean};
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
            'cluster': this.link.isClusterLink, /*,
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

    path.inactive{
        stroke: #ECEBE4;
        stroke-opacity: 0.6;
    }

    path.cluster {
        stroke-width: 1px;
        stroke-opacity: 0.6;
    }
    path.from-selected {
        stroke: #e4d836;
        stroke-opacity: 0.5;
        stroke-width: 1px;
    }

    path.to-selected {
        stroke: #1bc98e;
        stroke-opacity: 0.5;
        stroke-width: 1px;
    }
</style>