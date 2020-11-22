<template>
    <path
        :class="classObject"
        v-bind:d="hullLine"
    />
</template>

<script lang="ts">
import {Component, Prop} from 'vue-property-decorator';
import Vue from 'vue';
import {polygonHull} from 'd3-polygon';
import {curveCatmullRomClosed, line} from 'd3-shape';

@Component({})
export default class GraphStronglyConnectedComponent extends Vue {
    @Prop({default: false})
    greatest!: boolean;
    @Prop({})
    vertexCoordinates!: [number, number][];

    get hullLine() {
        let hull = polygonHull(this.vertexCoordinates);
        if (!hull)
            return null;

        let valueLine = line()
            .x(function (d) {
                return d[0];
            })
            .y(function (d) {
                return d[1];
            })
            .curve(curveCatmullRomClosed); //we want a smooth line

        let hullLine = valueLine(hull);
        if (hullLine) {
            return hullLine;
        }

        return null;
    }

    get classObject() {
        return {
            'scc': !this.greatest,
            'greatest': this.greatest,
        };
    }
}
</script>

<style scoped>
.scc {
    opacity: 0.1;
    fill: transparent;
    stroke: #1997c6;
    stroke-width: 10px;
}

.greatest {
    opacity: .1;
    fill: #1997c6;
    stroke: #1997c6;
    stroke-width: 20px;
}
</style>