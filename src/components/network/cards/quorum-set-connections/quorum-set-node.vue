<template>
        <text class="quorum-set-node" dy="0.31em"
              v-bind:transform="nodeTransform" v-on:click="clickNode"
              v-on:mouseover="$emit('node-selected', node)" v-on:mouseout="$emit('node-deselected', node)" v-bind:text-anchor="textAnchor"
              v-bind:class="classObject">
            {{node.data.origNode.name ? node.data.origNode.name.substr(0,15) :
            node.data.origNode.publicKey.substr(0,10)}}
        </text>
</template>

<script>

    export default {
        name: "quorum-set-node",
        props: {
            node: {
                type: Object
            }
        },
        computed: {
            isTarget: function() {
                return false;
            },

            isSource: function() {
                return false;
            },

            classObject: function () {
                return {
                    'target': this.node.data.isTarget,
                    'source' : this.node.data.isSource
                }
            },
            displayName: function () {
                return this.node.displayName;
            },
            nodeTransform: function () {
                let transform = "rotate(" + (this.node.x - 90) + ")translate(" + (this.node.y + 8) + ",0)";
                if (this.node.x >= 180)
                    transform += "rotate(180)";

                return transform;
            },

            textAnchor: function () {
                return this.node.x < 180 ? "start" : "end";
            },

            isEmbedded: function () {
                return this.$router.currentRoute.meta.isHeadlessRoute;
            }
        },
        methods: {
            clickNode: function () {
                if(this.isEmbedded) {
                    return;//disable click on embedded graph
                }
                this.$router.push({
                    name: 'node-dashboard',
                    params: {'publicKey': this.node.data.publicKey},
                    query: {'center': '1', "no-scroll": '0', 'view': this.$route.query.view}
                });
            }
        }
    }
</script>

<style scoped>
    .quorum-set-node {
        font: 300 14px "Helvetica Neue", Helvetica, Arial, sans-serif;
        fill: #bbb;
        cursor: pointer;
    }
    .quorum-set-node:hover {
        fill: #1997c6;
    }

    .quorum-set-node:hover,
    .source,
    .target {
        font-weight: 700;
    }

    .source {
        fill: #1bc98e;
    }

    .target {
        fill: #e4d836;
    }
</style>