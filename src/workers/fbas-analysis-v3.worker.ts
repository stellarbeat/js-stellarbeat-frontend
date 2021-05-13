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
    livenessAnalyzed: boolean,
    minimalBlockingSets: string[][] | undefined,
    minimalBlockingSetsMinSize: number | undefined,
    safetyAnalyzed: boolean,
    minimalSplittingSets: string[][] | undefined,
    minimalSplittingSetsMinSize: number | undefined,
}

ctx.addEventListener('message', (event) => {
    const nodes = event.data.nodes;
    const failingNodePublicKeys = event.data.failingNodePublicKeys;
    const organizations = event.data.organizations;
    const mergeBy = event.data.mergeBy;
    const analyzeQuorumIntersection = event.data.analyzeQuorumIntersection;
    const analyzeSafety = event.data.analyzeSafety;
    const analyzeLiveness = event.data.analyzeLiveness;

    if (!initialized) {
        init('stellar_analysis_bg.wasm').then(instance => {
            init_panic_hook();
            performAnalysis(nodes, failingNodePublicKeys, organizations, mergeBy, analyzeQuorumIntersection, analyzeLiveness, analyzeSafety);
            initialized = true;
        }).catch(reason => console.log(reason));
    } else {
        performAnalysis(nodes, failingNodePublicKeys, organizations, mergeBy, analyzeQuorumIntersection, analyzeLiveness, analyzeSafety);
    }
});

function performAnalysis(nodes: Node[], failingNodePublicKeys: PublicKey[], organizations: Organization[], mergeBy: MergeBy, analyzeQuorumIntersection: boolean, analyzeLiveness: boolean, analyzeSafety: boolean) {
    //@ts-ignore
    let analysis: FbasAnalysisWorkerResult = {};
    if (analyzeQuorumIntersection) {
        let minimalQuorumsAnalysis = analyze_minimal_quorums(JSON.stringify(nodes), JSON.stringify(organizations), mergeBy);
        analysis.hasQuorumIntersection = minimalQuorumsAnalysis.quorum_intersection;
        analysis.minimalQuorums = minimalQuorumsAnalysis.result;
        analysis.quorumIntersectionAnalyzed = true;
    } else
        analysis.quorumIntersectionAnalyzed = false;

    let topTierAnalysis = analyze_top_tier(JSON.stringify(nodes), JSON.stringify(organizations), mergeBy);
    analysis.hasSymmetricTopTier = topTierAnalysis.symmetric_top_tier !== null;
    analysis.topTier = topTierAnalysis.top_tier;
    analysis.topTierSize = topTierAnalysis.top_tier_size;

    if (analyzeLiveness) {
        let minimalBlockingSetsAnalysis = analyze_minimal_blocking_sets(JSON.stringify(nodes), JSON.stringify(organizations), JSON.stringify(failingNodePublicKeys), mergeBy);
        analysis.livenessAnalyzed = true;
        analysis.minimalBlockingSets = minimalBlockingSetsAnalysis.result;
        analysis.minimalBlockingSetsMinSize = minimalBlockingSetsAnalysis.min;
    }

    if (analyzeSafety) {
        let minimalSplittingSetsAnalysis = analyze_minimal_splitting_sets(JSON.stringify(nodes), JSON.stringify(organizations), mergeBy);
        analysis.safetyAnalyzed = true;
        analysis.minimalSplittingSets = minimalSplittingSetsAnalysis.result;
        analysis.minimalSplittingSetsMinSize = minimalSplittingSetsAnalysis.min;
    }

    ctx.postMessage({type: 'end', result: {analysis: analysis, mergeBy: mergeBy}});
}

export default ctx;
