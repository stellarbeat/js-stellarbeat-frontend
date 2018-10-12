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

<script>
    const QuorumService = require("@stellarbeat/js-stellar-domain").QuorumService;
    const Node = require("@stellarbeat/js-stellar-domain").Node;
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
            coordinateTransform: function() {
                return `translate(${this.node.x},${this.node.y})`;
            },
            circleRadius: function () {
                return "3px";
            },
            failing: function(){
                return this.network.failingNodes.includes(this.node);
            },

            selected: function() {
              return this.selectedNode === this.node
            },

            active: function() {
                return this.node.active
            },

            isTarget: function() {
                return this.targetNodes.includes(this.node) && this.selectedNode !== this.node
            },

            isSource: function() {
                return this.sourceNodes.includes(this.node) && this.selectedNode !== this.node
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
                return this.node.displayName;
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