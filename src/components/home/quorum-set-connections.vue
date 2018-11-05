<template>
    <div class="card ">
        <div class="card-header">
            <h3 class="card-title">Quorumset connections</h3>
            <div class="card-options">
                <router-link class="btn btn-sm btn-outline-primary" :to="{ name: 'quorum-monitor'}">Go to Quorum Monitor
                </router-link>
            </div>
        </div>
        <div class="card-body p-3 pb-6">
            <div class="row">
                <div class="col-6 d-flex">
                    <div class="quorum-connections-legend incoming-connection px-2 m-2">

                    </div>
                    <div class="text-right">
                        Incoming (trusted by)
                    </div>

                </div>
                <div class="col-6 d-flex">
                    <div class="quorum-connections-legend outgoing-connection px-2 m-2">
                    </div>
                    <div class="text-right">
                        Outgoing (trusts)
                    </div>
                </div>
            </div>
            <div class="row quorum-selected-node">
            </div>
            <div class="row">
                <svg class="graph" xmlns="http://www.w3.org/2000/svg"

                     width="100%"
                     viewBox="0 0 720 720"
                >
                    <g v-bind:transform="svgTransform" ref="quorumSvg">

                    </g>

                </svg>
            </div>
        </div>
    </div>
</template>

<script>
    import Chart from 'chart.js/dist/Chart.js'
    import * as d3 from "d3";

    const QuorumSet = require("@stellarbeat/js-stellar-domain").QuorumSet;

    export default {
        name: "quorum-set-connections",
        data() {
            return {
                diameter: 720,
                selectedNode: {}
            }
        },
        props: {
            network: {
                type: Object
            }
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
            treeNodes: function () {
                let children = this.network.nodes
                    .filter(node => node.active)
                    .map(node => {
                        return {
                            'publicKey': node.publicKey,
                            'children': [],
                            'validators': QuorumSet.getAllValidators(node.quorumSet),
                            'origNode': node
                        }
                    });
                let hierarchyData = {publicKey: '', children: children, name: ''};

                let root = d3.hierarchy(hierarchyData);
                let cluster = d3.cluster()
                    .size([360, this.innerRadius]);
                cluster(root);

                return root.leaves();
            },

            linkPaths: function () {
                let nodesMap = this.treeNodes.reduce(function (map, treeNode) {
                    map[treeNode.data.publicKey] = treeNode;
                    return map;
                }, {});

                let links = [];

                this.treeNodes.forEach(function (treeNode) {
                    if (treeNode.data.validators.length > 0) {
                        treeNode.data.validators.forEach(validator => {
                            if (nodesMap[validator]) {
                                links.push(nodesMap[treeNode.data.publicKey].path(nodesMap[validator]));
                            }// does the validator exist as a node

                        })
                    }
                });

                return links;
            }

        },
        methods: {
            initialize: function () {
                this.visualizeQuorum(this.network.nodes);
            },

            textTransform: function (node) {
                return "rotate(" + (node.x - 90) + "," + node.x + "," + node.y + ")";
            },
            textAnchor: function (node) {
                return node.x < 180 ? "start" : "end";
            },

            getPath: function (linkPath) {
                return 'M' + linkPath[0].x + ' ' + linkPath[0].y + ' L' + (linkPath[linkPath.length - 1].x) + ' ' + (linkPath[linkPath.length - 1].y);
            },

            visualizeQuorum: function (nodes) {
                let svg = d3.select(this.$refs.quorumSvg);

                let line = d3.radialLine()
                    .curve(d3.curveBundle.beta(0.85))
                    .radius(function (d) {
                        return d.y;
                    })
                    .angle(function (d) {
                        return d.x / 180 * Math.PI;
                    });

                let linksD3 = svg.append("g").selectAll(".link"),
                    nodesD3 = svg.append("g").selectAll(".node");


                linksD3 = linksD3
                    .data(this.linkPaths)
                    .enter().append("path")
                    .each(function (d) {
                        d.source = d[0], d.target = d[d.length - 1];
                    })
                    .attr("class", "quorum-set-link")
                    .attr("d", line);

                let that = this;

                nodesD3 = nodesD3
                    .data(this.treeNodes)
                    .enter().append("text")
                    .attr("class", "quorum-set-node")
                    .attr("dy", "0.31em")
                    .attr("transform", function (d) {
                        return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)");
                    })
                    .attr("text-anchor", function (d) {
                        return d.x < 180 ? "start" : "end";
                    })
                    .text(function (d) {
                        if (d.data.origNode.name) {
                            return d.data.origNode.name;
                        } else {
                            return d.data.publicKey.substring(0, 10);
                        }

                    })
                    .on("click", function (targetNodeD3) {
                        that.$router.push({name: 'quorum-monitor-node', params: {publicKey: targetNodeD3.data.publicKey}, query: {center: true, "no-scroll": false}});
                    })
                    .on("mouseover", function (targetNodeD3) {
                        that.showTrustLinks(targetNodeD3, nodesD3, linksD3);
                    })
                    .on("mouseout", function (targetNodeD3) {
                        that.removeTrustLinks(targetNodeD3, nodesD3, linksD3);
                    });
            },
            showTrustLinks: function (targetNodeD3, nodesD3, linksD3) {
                nodesD3
                    .each(function (n) {
                        n.target = n.source = false;
                    });

                linksD3
                    .classed("link--target", function (l) {
                        if (l.target === targetNodeD3) return l.source.source = true;
                    })
                    .classed("link--source", function (l) {
                        if (l.source === targetNodeD3) return l.target.target = true;
                    })
                    .filter(function (l) {
                        return l.target === targetNodeD3 || l.source === targetNodeD3;
                    })
                    .raise();

                nodesD3
                    .classed("node--target", function (n) {
                        return n.target;
                    })
                    .classed("node--source", function (n) {
                        return n.source;
                    });
            },

            removeTrustLinks: function (targetNodeD3, nodesD3, linksD3) {
                linksD3
                    .classed("link--target", false)
                    .classed("link--source", false);

                nodesD3
                    .classed("node--target", false)
                    .classed("node--source", false);
            }
        },
        mounted() {
            this.initialize();
        }
        ,
        beforeDestroy: function () {
            //this.chart.destroy()
        }
    }
</script>

<style>
    .quorum-set-node {
        font: 300 11px "Helvetica Neue", Helvetica, Arial, sans-serif;
        fill: #bbb;
        cursor: pointer;
    }

    .quorum-set-link {
        stroke: #1997c6;
        stroke-opacity: 0.34;
        fill: none;
        pointer-events: none;
    }
    .quorum-set-node a:hover {
        text-decoration: none;
    }
    .quorum-set-node:hover,
    .node--source,
    .node--target {
        font-weight: 700;
    }

    .node--source {
        fill: #1bc98e;
    }

    .node--target {
        fill: #e4d836;
    }

    .link--source,
    .link--target {
        stroke-opacity: 1;
        stroke-width: 2px;
    }

    .link--source {
        stroke: #e4d836;
    }

    .link--target {
        stroke: #1bc98e;
    }
</style>
<style scoped>
    path {
        stroke: #1997c6;
        stroke-width: 0.5px;
        stroke-opacity: 0.14;
        fill-opacity: 0;
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
</style>