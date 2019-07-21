<template>
    <div>
        <h5>Halting analysis</h5>
        <svg width="100%"
             height="600px" ref="svg"/>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import {Network, Node, QuorumSet} from "@stellarbeat/js-stellar-domain";
    import {haltingAnalysis, HaltingFailure} from "@stellar/halting-analysis";
    import {networkNodesToGraphData} from "@/services/core-node-admin-panel/util/QuorumParsing";
    import ForceGraph from "./../../node-analysis/ForceGraph";
    import {
        NetworkGraphNode,
        QuorumSet as NetworkQuorumSet
    } from "@stellar/halting-analysis";

    @Component({
        name: "halting-analysis-graph"
    })

    export default class HaltingAnalysisGraph extends Vue {

        @Prop()
        public network!: Network;

        @Prop()
        public selectedNode!: Node;

        public failures: HaltingFailure[] = [];

        @Watch('selectedNode')
        public onSelectedNodeChanged() {
            this.restartSimulation();
        }

        mounted() {
            this.restartSimulation();
        }

        restartSimulation(){
            let networkGraphNodes = this.network.nodes
                .filter(node => node.isValidator || node.isValidating || this.network.getTrustingNodes(node).length > 0)
                .map(node => this.mapNodeToNetworkGraphNode(node, node === this.selectedNode));

            let failures = haltingAnalysis(networkGraphNodes, 3);
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

        mapQuorumSetToNetworkQuorumSet(quorumSet: QuorumSet): NetworkQuorumSet {
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
<style src="./../../node-analysis/ForceGraph.css">
</style>