<template>
    <path
            v-bind:class="classObject"
            v-bind:d="path"
    />
</template>

<script>
    //const getControlPoints = require("get-control-points");

    export default {
        name: "graph-link",
        data() {
            return {
                curveSpacing: 10,
                curveAmount: 10
            }
        },
        props: {
            link: {
                type: Object
            },
            selectedNode: {
                type: Object
            }
        },
        computed: {
            path: function () {
                /*let controlPoints = getControlPoints([this.link.source.x,this.link.source.y],[this.link.target.x,this.link.target.y],0.3);
                return 'M' + this.link.source.x + ',' + this.link.source.y +
                    ' C' + controlPoints[0][0] + ',' + controlPoints[0][1] +
                    ' ' + controlPoints[1][0] + ',' + controlPoints[1][1] +
                    ' ' + (this.link.target.x) + ',' + (this.link.target.y)*/
                return 'M' + this.link.source.x + ' ' + this.link.source.y + ' L' + (this.link.target.x) + ' ' + (this.link.target.y);
            },
            classObject: function () {
                return {
                    'from-selected': this.link.source === this.selectedNode,
                    'to-selected': this.link.target === this.selectedNode,
                    'cluster': this.link.isClusterLink/*,
                    'inactive': !this.link.originLink.active*/
                }
            }
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