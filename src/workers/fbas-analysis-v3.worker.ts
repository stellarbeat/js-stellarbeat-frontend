import init, {
    analyze_minimal_blocking_sets,
    analyze_minimal_quorums,
    analyze_minimal_splitting_sets,
    analyze_top_tier,
    init_panic_hook,
    MergeBy
} from 'stellar_analysis';
import {Node, Organization, PublicKey} from '@stellarbeat/js-stellar-domain';

const ctx: Worker = self as any;
let initialized: boolean = false;

export type FbasAnalysisWorkerResult = {
    quorumIntersectionAnalyzed: boolean,
    hasQuorumIntersection: boolean | undefined,
    minimalQuorums: Array<Array<string>> | undefined,
    hasSymmetricTopTier: boolean,
    topTier: string[],
    topTierSize: number,
    topTierAnalyzed: boolean,
    livenessAnalyzed: boolean,
    minimalBlockingSets: string[][] | undefined,
    minimalBlockingSetsMinSize: number | undefined,
    safetyAnalyzed: boolean,
    minimalSplittingSets: string[][] | undefined,
    minimalSplittingSetsMinSize: number | undefined,
}

ctx.addEventListener('message', (event) => {
    const jobId = event.data.jobId;
    const nodes = event.data.nodes;
    const failingNodePublicKeys = event.data.failingNodePublicKeys;
    const organizations = event.data.organizations;
    const mergeBy = event.data.mergeBy;
    const analyzeQuorumIntersection = event.data.analyzeQuorumIntersection;
    const analyzeSafety = event.data.analyzeSafety;
    const analyzeLiveness = event.data.analyzeLiveness;
    const analyzeTopTier = event.data.analyzeTopTier;

    if (!initialized) {
        init('stellar_analysis_bg.wasm').then(instance => {
            init_panic_hook();
            initialized = true;
            performAnalysis(nodes, failingNodePublicKeys, organizations, mergeBy, analyzeQuorumIntersection, analyzeLiveness, analyzeSafety, analyzeTopTier, jobId);
        }).catch(reason => console.log(reason));
    } else {
        performAnalysis(nodes, failingNodePublicKeys, organizations, mergeBy, analyzeQuorumIntersection, analyzeLiveness, analyzeSafety, analyzeTopTier, jobId);
    }
});

function performAnalysis(nodes: Node[], failingNodePublicKeys: PublicKey[], organizations: Organization[], mergeBy: MergeBy, analyzeQuorumIntersection: boolean, analyzeLiveness: boolean, analyzeSafety: boolean, analyzeTopTier: boolean, jobId: number) {
    //@ts-ignore
    let analysis: FbasAnalysisWorkerResult = {};
    if (analyzeQuorumIntersection) {
        console.log("analyze quorum intersection");
        let minimalQuorumsAnalysis = analyze_minimal_quorums(JSON.stringify(nodes), JSON.stringify(organizations), mergeBy);
        analysis.hasQuorumIntersection = minimalQuorumsAnalysis.quorum_intersection;
        analysis.minimalQuorums = minimalQuorumsAnalysis.result;
        analysis.quorumIntersectionAnalyzed = true;
    } else
        analysis.quorumIntersectionAnalyzed = false;

    if(analyzeTopTier){
        let topTierAnalysis = analyze_top_tier(JSON.stringify(nodes), JSON.stringify(organizations), mergeBy);
        console.log("analyze top tier");
        analysis.hasSymmetricTopTier = topTierAnalysis.symmetric_top_tier !== null;
        analysis.topTier = topTierAnalysis.top_tier;
        analysis.topTierSize = topTierAnalysis.top_tier_size;
        analysis.topTierAnalyzed = true;
    } else
        analysis.topTierAnalyzed = false;

    if (analyzeLiveness) {
        console.log("analyze liveness");
        let minimalBlockingSetsAnalysis = analyze_minimal_blocking_sets(JSON.stringify(nodes), JSON.stringify(organizations), JSON.stringify(failingNodePublicKeys), mergeBy);
        analysis.livenessAnalyzed = true;
        analysis.minimalBlockingSets = minimalBlockingSetsAnalysis.result;
        analysis.minimalBlockingSetsMinSize = minimalBlockingSetsAnalysis.min;
    } else
        analysis.livenessAnalyzed = false;

    if (analyzeSafety) {
        console.log("analyze safety");
        let minimalSplittingSetsAnalysis = analyze_minimal_splitting_sets(JSON.stringify(nodes), JSON.stringify(organizations), mergeBy);
        analysis.safetyAnalyzed = true;
        analysis.minimalSplittingSets = minimalSplittingSetsAnalysis.result;
        analysis.minimalSplittingSetsMinSize = minimalSplittingSetsAnalysis.min;
    } else
        analysis.safetyAnalyzed = false;

    ctx.postMessage({type: 'end', result: {analysis: analysis, mergeBy: mergeBy, jobId}});
}

export default ctx;
