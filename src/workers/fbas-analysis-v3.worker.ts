import init, {
  analyze_minimal_blocking_sets,
  analyze_minimal_quorums,
  analyze_minimal_splitting_sets,
  analyze_symmetric_top_tier,
  analyze_top_tier,
  init_panic_hook,
  MergeBy,
} from "@stellarbeat/stellar_analysis_web";
import {
  Node,
  Organization,
  type PublicKey,
} from "@stellarbeat/js-stellarbeat-shared";
//@ts-ignore
import wasmUrl from "@stellarbeat/stellar_analysis_web/stellar_analysis_bg.wasm?url";
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
    init(wasmUrl)
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
          jobId,
        );
      })
      .catch((e) => {
        console.log("Failed to initialize wasm module", e);
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
      jobId,
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
  jobId: number,
) {
  const analysis: FbasAnalysisWorkerResult = {
    quorumIntersectionAnalyzed: false,
    hasQuorumIntersection: undefined,
    minimalQuorums: undefined,
    hasSymmetricTopTier: false,
    hasSymmetricTopTierAnalyzed: false,
    topTier: [],
    topTierSize: 0,
    topTierAnalyzed: false,
    livenessAnalyzed: false,
    minimalBlockingSets: undefined,
    minimalBlockingSetsMinSize: undefined,
    safetyAnalyzed: false,
    minimalSplittingSets: undefined,
    minimalSplittingSetsMinSize: undefined,
  };

  if (analyzeSymmetricTopTier) {
    const symmetricTopTierAnalysis = analyze_symmetric_top_tier(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy,
    ) as {
      symmetric_top_tier: string[] | null;
    };
    analysis.hasSymmetricTopTier =
      symmetricTopTierAnalysis.symmetric_top_tier !== null;
    analysis.hasSymmetricTopTierAnalyzed = true;
  } else analysis.hasSymmetricTopTierAnalyzed = false;
  if (analyzeQuorumIntersection) {
    const minimalQuorumsAnalysis = analyze_minimal_quorums(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy,
    ) as {
      quorum_intersection: boolean;
      result: Array<Array<string>>;
    };
    analysis.hasQuorumIntersection = minimalQuorumsAnalysis.quorum_intersection;
    analysis.minimalQuorums = minimalQuorumsAnalysis.result;
    analysis.quorumIntersectionAnalyzed = true;
  } else analysis.quorumIntersectionAnalyzed = false;

  if (analyzeTopTier) {
    const topTierAnalysis = analyze_top_tier(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy,
    ) as {
      top_tier: string[];
      top_tier_size: number;
    };
    analysis.topTier = topTierAnalysis.top_tier;
    analysis.topTierSize = topTierAnalysis.top_tier_size;
    analysis.topTierAnalyzed = true;
  } else analysis.topTierAnalyzed = false;

  if (analyzeLiveness) {
    const minimalBlockingSetsAnalysis = analyze_minimal_blocking_sets(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      JSON.stringify(failingNodePublicKeys),
      mergeBy,
    ) as {
      result: string[][];
      min: number;
    };
    analysis.livenessAnalyzed = true;
    analysis.minimalBlockingSets = minimalBlockingSetsAnalysis.result;
    analysis.minimalBlockingSetsMinSize = minimalBlockingSetsAnalysis.min;
  } else analysis.livenessAnalyzed = false;

  if (analyzeSafety) {
    const minimalSplittingSetsAnalysis = analyze_minimal_splitting_sets(
      JSON.stringify(nodes),
      JSON.stringify(organizations),
      mergeBy,
    ) as {
      result: string[][];
      min: number;
    };
    analysis.safetyAnalyzed = true;
    analysis.minimalSplittingSets = minimalSplittingSetsAnalysis.result;
    analysis.minimalSplittingSetsMinSize = minimalSplittingSetsAnalysis.min;
  } else analysis.safetyAnalyzed = false;

  ctx.postMessage({
    type: "end",
    result: { analysis: analysis, mergeBy: mergeBy, jobId: jobId },
  });
}
