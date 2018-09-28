<template>
    <g :transform="`translate(${node.x},${node.y})`">
        <circle
                :r="circleRadius"
                v-bind:class="classObject"
                v-on:click="nodeSelected"
        ></circle>
        <text y="5" dy="1em" text-anchor="middle" font-size="4px">{{ displayName | truncate(10)}}</text>
    </g>
</template>

<script>
    const QuorumService = require("./../services/quorum");
    const Node = require("./../entities/node");
    export default {
        name: "graph-node",
        props: {
            node: {
                type: Object
            },
            network: {
                type: Object
            },
            selectedNode: {
                type: Object
            },
            targetNodes: {
                type: Array
            },
            sourceNodes: {
                type: Array
            }
        },
        computed: {
            circleRadius: function () {
                return "3px";
            },
            failing: function(){
                return this.network.failingNodes.includes(this.node.originNode);
            },

            selected: function() {
              return this.selectedNode === this.node.originNode
            },

            active: function() {
                return this.node.originNode.active
            },

            isTarget: function() {
                return this.targetNodes.includes(this.node.originNode) && this.selectedNode !== this.node.originNode
            },

            isSource: function() {
                return this.sourceNodes.includes(this.node.originNode) && this.selectedNode !== this.node.originNode
            },

            classObject: function () {
                return {
                    'active': this.active,
                    'selected': this.selected,
                    'failing': this.failing,
                    'target': this.isTarget,
                    'source' : this.isSource
                }
            },
            displayName: function () {
                return this.node.originNode.displayName;
            }
        },
        methods: {
            nodeSelected: function () {
                this.$emit("node-selected", this.node);
            }
        }
    }
</script>

<style scoped>
    circle.active {
        fill: #74e1ff;
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
        stroke: transparent;
        fill: #ECEBE4;
        cursor: pointer;
        stroke-width: 2px;
    }
    text{
        opacity: 0.7;
    }
</style>