<template>
    <div>
        <div>
            <div class="page-header">
                <h1 class="page-title">
                    Halting analysis
                </h1>
            </div>
            <div class="card">
                <div class="card-body">
                    <svg width="100%"
                         height="600px" ref="svg" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import {Network, Node, QuorumSet} from "@stellarbeat/js-stellar-domain";
    import {haltingAnalysis} from "@stellar/halting-analysis";
    import { networkNodesToGraphData } from "./../services/core-node-admin-panel/util/QuorumParsing";
    import ForceGraph from "../components/node-analysis/ForceGraph";
    import "../components/node-analysis/ForceGraph.css";
    import {
        NetworkGraphNode,
        QuorumSet as NetworkQuorumSet
    } from "@stellar/halting-analysis";

    @Component({
        name: "scratch",
        metaInfo: {
            title: "Scratch - Stellarbeat.io",
            meta: [
                {name: "description", content: "Scratch"},
            ],
        },
    })
    export default class Scratch extends Vue {

        @Prop()
        public network!: Network;
        @Prop()
        public isLoading!: boolean;

        mounted() {
            let rootNode = this.network.nodes.find(node => node.publicKey === 'GDRA72H7JWXAXWJKOONQOPH3JKNSH5MQ6BO5K74C3X6FO2G3OG464BPU');
            if(!rootNode) {
                return;
            }
            let networkGraphNodes = this.network.nodes
                .filter(node => node.isValidator || node.isValidating || this.network.getTrustingNodes(node).length > 0)
                .map(node => this.mapNodeToNetworkGraphNode(node, node === rootNode));

            let failures = haltingAnalysis(networkGraphNodes, 4);
            let quorum = networkNodesToGraphData(networkGraphNodes);
            ForceGraph(this.$refs.svg as SVGSVGElement, quorum, failures[0]);

        }

        mapNodeToNetworkGraphNode(node: Node, isRoot: boolean) {
            return {
                "distance": isRoot ? 0 : 1,
                "node": node.publicKey,
                "status": node.isValidating ? "tracking" : "missing",
                "qset": this.mapQuorumSetToNetworkQuorumSet(node.quorumSet)
            } as NetworkGraphNode;
        }

        mapQuorumSetToNetworkQuorumSet(quorumSet: QuorumSet):NetworkQuorumSet {
            let innerQSets = quorumSet.innerQuorumSets.map(innerQSet => this.mapQuorumSetToNetworkQuorumSet(innerQSet));
            let v = [];
            v.push(...quorumSet.validators);
            innerQSets.forEach(innerQSet => v.push(innerQSet));

            return {
                "t": quorumSet.threshold,
                "v": v
            };
        }
    }
</script>
<style scoped>
</style>