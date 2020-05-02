<template>
    <div>
        <div class="card ">
            <div class="card-body p-3 pb-6">
                <div class="d-flex justify-content-center">
                    <div class="graph-container">
                        <svg class="graph" xmlns="http://www.w3.org/2000/svg"
                             height="100%"
                             width="100%"
                             viewBox="-40 0 800 720"
                        >
                            <g v-bind:transform="svgTransform" ref="quorumSvg">
                                <g>
                                    <QuorumSetNode v-for="node in treeNodes" :node="node"
                                                   :key="node.publicKey"
                                                   v-on:node-selected="showTrustLinks(node)"
                                                   v-on:node-deselected="removeTrustLinks()">
                                    </QuorumSetNode>
                                </g>
                                <g>
                                    <path v-for="link in links" class="quorum-set-link"
                                          v-bind:d="path(link)"
                                    />
                                    <path v-for="link in targetLinks" class="link-target"
                                          v-bind:d="path(link)"
                                    />
                                    <path v-for="link in sourceLinks" class="link-source"
                                          v-bind:d="path(link)"
                                    />
                                </g>

                            </g>

                        </svg>
                    </div>
                </div>
                <div class="d-flex justify-content-center">
                    <div class="d-flex">
                        <div class="quorum-connections-legend incoming-connection px-2 m-2">

                        </div>
                        <div class="text-right">
                            Incoming (trusted by)
                        </div>

                    </div>
                    <div class="d-flex">
                        <div class="quorum-connections-legend outgoing-connection px-2 m-2">
                        </div>
                        <div class="text-right">
                            Outgoing (trusts)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {hierarchy, cluster} from "d3-hierarchy";
    import {radialLine, curveBundle} from "d3-shape";
    import QuorumSetNode from './quorum-set-node.vue';
    import {QuorumSet} from '@stellarbeat/js-stellar-domain';

    export default {
        name: "quorum-set-connections",
        data() {
            return {
                diameter: 720,
                selectedNode: {},
                sourceLinks: [],
                targetLinks: [],
                treeNodes: []
            }
        },
        components: {
            QuorumSetNode
        },
        props: {},
        created() {

            let children = this.network.nodes
                .filter(node => node.active)
                .map(node => {
                    return {
                        'publicKey': node.publicKey,
                        'children': [],
                        'validators': QuorumSet.getAllValidators(node.quorumSet),
                        'origNode': node,
                        'isSource': false,
                        'isTarget': false
                    };
                });
            this.shuffleArray(children);
            let root = hierarchy({publicKey: '', children: children, name: ''});
            let myCluster = cluster()
                .size([360, this.innerRadius]);
            myCluster(root);

            this.treeNodes = root.leaves();

        },
        computed: {
            radius: function () {
                return this.diameter / 2;
            },
            innerRadius: function () {
                return this.radius - 120;
            },
            svgTransform: function () {
                return "translate(" + this.radius + "," + this.radius + ")";
            },
            network: function () {
                return this.$root.$data.store.network;
            },
            links: function () {
                let nodesMap = this.treeNodes.reduce(function (map, treeNode) {
                    map[treeNode.data.publicKey] = treeNode;
                    return map;
                }, {});

                let newLinks = [];

                this.treeNodes.forEach(function (treeNode) {
                    QuorumSet.getAllValidators(treeNode.data.origNode.quorumSet).forEach(
                        validator => {
                            if (nodesMap[validator])
                                newLinks.push(nodesMap[treeNode.data.publicKey].path(nodesMap[validator]));
                        }
                    );
                });

                return newLinks;
            },
            isHeadlessRoute: function () {
                return this.$router.currentRoute.meta.isHeadlessRoute;
            }
        },
        methods: {
            path: function (link) {
                let line = radialLine()
                    .curve(curveBundle.beta(0.85))
                    .radius(function (data) {
                        return data.y;
                    })
                    .angle(function (data) {
                        return data.x / 180 * Math.PI;
                    });

                return line(link);
            },

            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            },

            showTrustLinks: function (node) {
                this.selectedNode = node;
                this.links.forEach(link => {
                    if (link[0] === node) {
                        this.sourceLinks.push(link);
                        if (node !== link[link.length - 1]) //do not mark selected node as target
                            link[link.length - 1].data.isTarget = true;
                    }
                    if (link[link.length - 1] === node) {
                        this.targetLinks.push(link);
                        if (node !== link[0]) //do not mark selected node as source
                            link[0].data.isSource = true;
                    }
                });
            },

            removeTrustLinks: function () {
                this.treeNodes.forEach(node => {
                    node.data.isSource = false;
                    node.data.isTarget = false;
                });
                this.sourceLinks = [];
                this.targetLinks = [];
            }
        }
    }
</script>

<style scoped>
    .graph-container {
        max-height: 740px;
        max-width: 740px;
    }

    .quorum-set-link {
        stroke: #1997c6;
        stroke-opacity: 0.34;
        fill: none;
        pointer-events: none;
    }

    .link-source,
    .link-target {
        fill: none;
        stroke-opacity: 1;
        stroke-width: 2px;
    }

    .link-source {
        stroke: #e4d836;
    }

    .link-target {
        stroke: #1bc98e;
    }

    #quorum {
        width: 100%;
    }

    .quorum-connections-legend {
        background: #1997c6;
        color: white;
        border-radius: 0px;
        width: 30px;
        height: 10px;
    }

    .incoming-connection {
        background: #1bc98e;
    }

    .outgoing-connection {
        background: #e4d836;
    }

    .headless {
        background: #FBFAF7;
    }
</style>