<template>
    <!--g>
        <defs>
            <marker id='head' orient='auto' markerWidth='2' markerHeight='4'
                    refX='12' refY='2'>
                <path d='M0,0 V4 L2,2 Z' fill='red'/>
            </marker>
        </defs>
        <path
                marker-end='url(#head)'
                stroke-width='1' fill='black' stroke='black'
                v-bind:d="path"
        />
    </g!-->

    <line
          :x1="graphLink.source.x"
          :y1="graphLink.source.y"
          :x2="graphLink.target.x"
          :y2="graphLink.target.y"
          v-bind:class="classObject"
    >
    </line>
</template>

<script>
    export default {
        name: "graph-link",
        props: {
            graphLink: {
                type: Object
            },
            selectedNode: {
                type: Object
            }
        },
        computed: {
            path: function () {
                return 'M' + this.graphLink.source.x + ' ' + this.graphLink.source.y + ' L' + (this.graphLink.target.x) + ' ' + (this.graphLink.target.y)
            },
            classObject: function () {
                return {
                    'from-selected': this.graphLink.source.originNode === this.selectedNode,
                    'to-selected': this.graphLink.target.originNode === this.selectedNode,
                    'cluster': this.graphLink.originLink.isClusterLink/*,
                    'inactive': !this.graphLink.originLink.active*/
                }
            }
        }
    }
</script>

<style scoped>
    line {
        stroke: #74e1ff;
        stroke-width: 0.5px;
        stroke-opacity: 0.34;
    }

    line.inactive{
        stroke: #ECEBE4;
        stroke-opacity: 0.6;
    }

    line.cluster {
        stroke-width: 0.8px;
        stroke-opacity: 1;
    }
    line.from-selected {
        stroke: #e4d836;
        stroke-opacity: 0.7;
        stroke-width: 1px;
    }

    line.to-selected {
        stroke: #1bc98e;
        stroke-opacity: 0.7;
        stroke-width: 1px;
    }
</style>