import init, {
  analyze_minimal_blocking_sets,
  analyze_minimal_quorums,
  analyze_minimal_splitting_sets,
  analyze_top_tier,
  init_panic_hook,
  analyze_symmetric_top_tier,
  MergeBy,
} from "@stellarbeat/stellar_analysis_web";
import { Node, Organization, PublicKey } from "@stellarbeat/js-stellar-domain";

//@ts-ignore
const ctx: Worker = self;
let initialized = false;

export type FbasAnalysisWorkerResult = {
  quorumIntersectionAnalyzed: boolean;
  hasQuorumIntersection: boolean | undefined;
  minimalQuorums: Array<Array<string>> | undefined;
  hasSymmetricTopTier: boolean;
  hasSymmetricTopTierAnalyzed: boolean;
  topTier: string[];
  topTierSize: number;
  topTierAnalyzed: boolean;
  livenessAnalyzed: boolean;
  minimalBlockingSets: string[][] | undefined;
  minimalBlockingSetsMinSize: number | undefined;
  safetyAnalyzed: boolean;
  minimalSplittingSets: string[][] | undefined;
  minimalSplittingSetsMinSize: number | undefined;
};

ctx.addEventListener("message", (event) => {
  const jobId = event.data.jobId;
  const nodes = event.data.nodes;
  const failingNodePublicKeys = event.data.failingNodePublicKeys;
  const organizations = event.data.organizations;
  const mergeBy = event.data.mergeBy;
  const analyzeQuorumIntersection = event.data.analyzeQuorumIntersection;
  const analyzeSafety = event.data.analyzeSafety;
  const analyzeLiveness = event.data.analyzeLiveness;
  const analyzeTopTier = event.data.analyzeTopTier;
  const analyzeSymmetricTopTier = event.data.analyzeSymmetricTopTier;

  if (!initialized) {
    init("stellar_analysis_bg.wasm")
      .then(() => {
        init_panic_hook();
        initialized = true;
        performAnalysis(
          nodes,
          failingNodePublicKeys,
          organizations,
          mergeBy,
          analyzeQuorumIntersection,
          analyzeLiveness,
          analyzeSafety,
          analyzeTopTier,
          analyzeSymmetricTopTier,
          jobId
        );
      })
      .catch(() => {
        //TODO: handle error
      });
  } else {
    performAnalysis(
      nodes,
      failingNodePublicKeys,
      organizations,
      mergeBy,
      analyzeQuorumIntersection,
      analyzeLiveness,
      analyzeSafety,
      analyzeTopTier,
      analyzeSymmetricTopTier,
      jobId
    );
  }
});

function performAnalysis(
  nodes: Node[],
  failingNodePublicKeys: PublicKey[],
  organizations: Organization[],
  mergeBy: MergeBy,
  analyzeQuorumIntersection: boolean,
  analyzeLiveness: boolean,
  analyzeSafety: boolean,
  analyzeTopTier: boolean,
  analyzeSymmetricTopTier: boolean,
  jobId: number
) {
  //@ts-ignore
  const analysis: FbasAnalysisWorkerResult = {};
  if (analyzeSymmetricTopTier) {
    const symmetricTopTierAnalysis = analyze_symmetric_top_tier(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy
    );
    analysis.hasSymmetricTopTier =
      symmetricTopTierAnalysis.symmetric_top_tier !== null;
    analysis.hasSymmetricTopTierAnalyzed = true;
  } else analysis.hasSymmetricTopTierAnalyzed = false;
  if (analyzeQuorumIntersection) {
    const minimalQuorumsAnalysis = analyze_minimal_quorums(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy
    );
    analysis.hasQuorumIntersection = minimalQuorumsAnalysis.quorum_intersection;
    analysis.minimalQuorums = minimalQuorumsAnalysis.result;
    analysis.quorumIntersectionAnalyzed = true;
  } else analysis.quorumIntersectionAnalyzed = false;

  if (analyzeTopTier) {
    const topTierAnalysis = analyze_top_tier(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy
    );
    analysis.topTier = topTierAnalysis.top_tier;
    analysis.topTierSize = topTierAnalysis.top_tier_size;
    analysis.topTierAnalyzed = true;
  } else analysis.topTierAnalyzed = false;

  if (analyzeLiveness) {
    const minimalBlockingSetsAnalysis = analyze_minimal_blocking_sets(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      JSON.stringify(failingNodePublicKeys),
      mergeBy
    );
    analysis.livenessAnalyzed = true;
    analysis.minimalBlockingSets = minimalBlockingSetsAnalysis.result;
    analysis.minimalBlockingSetsMinSize = minimalBlockingSetsAnalysis.min;
  } else analysis.livenessAnalyzed = false;

  if (analyzeSafety) {
    const minimalSplittingSetsAnalysis = analyze_minimal_splitting_sets(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy
    );
    analysis.safetyAnalyzed = true;
    analysis.minimalSplittingSets = minimalSplittingSetsAnalysis.result;
    analysis.minimalSplittingSetsMinSize = minimalSplittingSetsAnalysis.min;
  } else analysis.safetyAnalyzed = false;

  ctx.postMessage({
    type: "end",
    result: { analysis: analysis, mergeBy: mergeBy, jobId: jobId },
  });
}

export default ctx;
