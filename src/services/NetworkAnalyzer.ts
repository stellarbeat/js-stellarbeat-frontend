import FbasAnalysisWorker from 'worker-loader?name=worker/[name].js!../workers/fbas-analysis-v3.worker.ts';

const _FbasAnalysisWorker: any = FbasAnalysisWorker; // workaround for typescript not compiling web workers.
import {FbasAnalysisWorkerResult} from '@/workers/fbas-analysis-v3.worker';
import {Network, Node} from '@stellarbeat/js-stellar-domain';
import {MergeBy} from 'stellar_analysis';

export enum AutomaticNetworkAnalysis {
    Init,
    AnalyzingNodesTopTier,
    AnalyzingOrganizationTopTier,
    AnalyzingNodes,
    AnalyzingOrganizations,
    AnalyzingCountries,
    AnalyzingISPs,
    Done
}

export default class NetworkAnalyzer {
    protected fbasAnalysisWorker = new _FbasAnalysisWorker(); //todo shared worker!
    protected network: Network;
    protected networkAnalysisId: number = 0;
    public analyzing: boolean = false;
    public automaticState: AutomaticNetworkAnalysis = AutomaticNetworkAnalysis.Init;
    protected hasSymmetricTopTier: boolean = false;
    public manualMode: boolean = false;

    constructor(network: Network) {
        this.network = network;
        this.fbasAnalysisWorker.onmessage = (
            event: { data: { type: string, result: any } }
        ) => {
            switch (event.data.type) {
                case 'end': {
                    if (event.data.result) {
                        let analysisResult: FbasAnalysisWorkerResult = event.data.result.analysis;
                        if (event.data.result.jobId !== this.networkAnalysisId)
                            return; //we ignore old/stale analysis

                        switch (this.automaticState) {
                            case AutomaticNetworkAnalysis.AnalyzingNodesTopTier:
                                this.network.networkStatistics.topTierSize = analysisResult.topTierSize;
                                this.hasSymmetricTopTier = analysisResult.hasSymmetricTopTier;
                                if (this.hasSymmetricTopTier || this.network.nodesTrustGraph.networkTransitiveQuorumSet.size <= 10) {
                                    this.manualMode = false;
                                    this.analyzeNodes();
                                } else { //the automatic network analysis stops because it will be too slow
                                    this.manualMode = true;
                                    this.analyzeOrganizationsTopTier();
                                }
                                break;
                            case AutomaticNetworkAnalysis.AnalyzingOrganizationTopTier:
                                this.network.networkStatistics.topTierOrgsSize = analysisResult.topTierSize;
                                this.automaticState = AutomaticNetworkAnalysis.Done;
                                break;
                            case AutomaticNetworkAnalysis.AnalyzingNodes:
                                this.network.networkStatistics.hasQuorumIntersection = analysisResult.hasQuorumIntersection;
                                this.network.networkStatistics.minBlockingSetFilteredSize = analysisResult.minimalBlockingSetsMinSize!;
                                this.network.networkStatistics.minSplittingSetSize = analysisResult.minimalSplittingSetsMinSize!;
                                this.analyzeOrganizations();
                                break;
                            case AutomaticNetworkAnalysis.AnalyzingOrganizations:
                                this.network.networkStatistics.minBlockingSetOrgsFilteredSize = analysisResult.minimalBlockingSetsMinSize;
                                this.network.networkStatistics.topTierOrgsSize = analysisResult.topTierSize;
                                this.analyzeCountries();
                                break;
                            case AutomaticNetworkAnalysis.AnalyzingCountries:
                                this.network.networkStatistics.minBlockingSetCountryFilteredSize = analysisResult.minimalBlockingSetsMinSize;
                                this.analyzeISPs();
                                break;
                            case AutomaticNetworkAnalysis.AnalyzingISPs:
                                this.network.networkStatistics.minBlockingSetISPFilteredSize = analysisResult.minimalBlockingSetsMinSize;
                                this.automaticState = AutomaticNetworkAnalysis.Done;
                                break;
                        }
                    }
                    this.analyzing = false;
                    break;
                }
            }
        };
    }

    protected initAnalysis() {
    }

    public analyzeNetwork() {
        if(this.analyzing){
            this.fbasAnalysisWorker.terminate();
            console.log("terminate");
        }
        this.initAnalysis();
        this.networkAnalysisId++;
        this.analyzeNodesTopTier();
    }

    protected analyzeNodesTopTier() {
        this.analyzing = true;
        this.automaticState = AutomaticNetworkAnalysis.AnalyzingNodesTopTier;
        this.fbasAnalysisWorker.postMessage({
            jobId: this.networkAnalysisId,
            nodes: this.getCorrectlyConfiguredNodes(this.network),
            organizations: this.network.organizations,
            mergeBy: MergeBy.DoNotMerge,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeTopTier: true,
            analyzeQuorumIntersection: false,
            analyzeSafety: false,
            analyzeLiveness: false
        });
    }

    protected analyzeOrganizationsTopTier() {
        this.analyzing = true;
        this.automaticState = AutomaticNetworkAnalysis.AnalyzingOrganizationTopTier;
        this.fbasAnalysisWorker.postMessage({
            jobId: this.networkAnalysisId,
            nodes: this.getCorrectlyConfiguredNodes(this.network),
            organizations: this.network.organizations,
            mergeBy: MergeBy.Orgs,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeTopTier: true,
            analyzeQuorumIntersection: false,
            analyzeSafety: false,
            analyzeLiveness: false
        });
    }

    protected analyzeNodes() { //we run all the analysis on the nodes
        this.analyzing = true;
        this.automaticState = AutomaticNetworkAnalysis.AnalyzingNodes;
        this.fbasAnalysisWorker.postMessage({
            jobId: this.networkAnalysisId,
            nodes: this.getCorrectlyConfiguredNodes(this.network),
            organizations: this.network.organizations,
            mergeBy: MergeBy.DoNotMerge,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeTopTier: false, //already done
            analyzeQuorumIntersection: true,
            analyzeSafety: true,
            analyzeLiveness: true
        });
    }

    protected analyzeOrganizations() {
        this.analyzing = true;
        this.automaticState = AutomaticNetworkAnalysis.AnalyzingOrganizations;
        this.fbasAnalysisWorker.postMessage({
            jobId: this.networkAnalysisId,
            nodes: this.getCorrectlyConfiguredNodes(this.network),
            organizations: this.network.organizations,
            mergeBy: MergeBy.Orgs,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeTopTier: true,
            analyzeQuorumIntersection: false,
            analyzeSafety: true,
            analyzeLiveness: true
        });
    }

    protected analyzeCountries() {
        this.analyzing = true;
        this.automaticState = AutomaticNetworkAnalysis.AnalyzingCountries;
        this.fbasAnalysisWorker.postMessage({
            jobId: this.networkAnalysisId,
            nodes: this.getCorrectlyConfiguredNodes(this.network),
            organizations: this.network.organizations,
            mergeBy: MergeBy.Countries,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeTopTier: false,
            analyzeQuorumIntersection: false,
            analyzeSafety: true,
            analyzeLiveness: true
        });
    }

    protected analyzeISPs() {
        this.analyzing = true;
        this.automaticState = AutomaticNetworkAnalysis.AnalyzingISPs;
        this.fbasAnalysisWorker.postMessage({
            jobId: this.networkAnalysisId,
            nodes: this.getCorrectlyConfiguredNodes(this.network),
            organizations: this.network.organizations,
            mergeBy: MergeBy.ISPs,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeTopTier: false,
            analyzeQuorumIntersection: false,
            analyzeSafety: true,
            analyzeLiveness: true
        });
    }

    protected getCorrectlyConfiguredNodes(network: Network) {
        let isNodeCorrectlyConfigured = (node: Node) => {
            return !(node.quorumSet.validators.length === 1
                && node.publicKey === node.quorumSet.validators[0]
                && node.quorumSet.innerQuorumSets.length === 0);
        };

        return network.nodes.filter(node => isNodeCorrectlyConfigured(node));
    }
}