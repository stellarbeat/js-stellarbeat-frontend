<template>
  <b-card no-body>
    <b-card-header class="p-3">
      <h3 class="card-title">Network analysis</h3>
      <div class="card-options">
        <a
          href="#"
          class="card-options-remove"
          data-toggle="card-remove"
          @click.prevent.stop="store.isNetworkAnalysisVisible = false"
        >
          <b-icon-x class="mr-2" />
        </a>
      </div>
    </b-card-header>
    <b-card-body class="px-3 pt-4 pb-2">
      <div :class="dimmerClass">
        <div class="loader mt-2"></div>
        <div class="dimmer-content">
          <div v-if="hasResult">
            <div class="accordion" role="tablist">
              <b-card
                v-if="quorumIntersectionAnalyzed"
                no-body
                class="mb-1 border-0"
              >
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <button
                    v-b-toggle.accordion-quorum
                    class="btn btn-block btn-outline-primary"
                  >
                    Quorum intersection
                  </button>
                </b-card-header>
                <b-collapse
                  id="accordion-quorum"
                  visible
                  accordion="my-accordion"
                  role="tabpanel"
                >
                  <b-card-body class="px-0 pb-0">
                    <analysis
                      title="Minimal quorums"
                      :items="minimalQuorums"
                      :nodes-partition="nodesPartition"
                      :show-nodes-partition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template #title>
                        <div
                          class="d-flex justify-content-between align-items-baseline"
                        >
                          <h3>
                            <b-badge
                              :variant="
                                hasQuorumIntersection ? 'success' : 'danger'
                              "
                            >
                              {{
                                hasQuorumIntersection
                                  ? "All quorums intersect"
                                  : "No quorum intersection"
                              }}
                            </b-badge>
                          </h3>
                          <button class="btn btn-sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-qi-info'"
                              v-tooltip:top="'Info'"
                              class="text-muted"
                            />
                          </button>
                          <quorum-intersection-info />
                        </div>
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card v-if="livenessAnalyzed" no-body class="mb-1 border-0">
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <button
                    v-b-toggle.accordion-liveness
                    class="btn-primary btn btn-block"
                  >
                    Liveness risk
                  </button>
                </b-card-header>
                <b-collapse
                  id="accordion-liveness"
                  visible
                  accordion="my-accordion"
                  role="tabpanel"
                >
                  <b-card-body class="px-0 pb-0">
                    <analysis
                      title="Blocking sets"
                      :items="blockingSets"
                      :nodes-partition="nodesPartition"
                      :show-nodes-partition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template #title>
                        <div
                          class="d-flex justify-content-between align-items-baseline"
                        >
                          <h3 v-if="blockingSetsMinSize <= 0">
                            Network halted.
                          </h3>
                          <h3 v-else>
                            Found set(s) of size
                            {{ blockingSetsMinSize }}
                            that could impact liveness.
                          </h3>
                          <button class="btn btn-sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-liveness-info'"
                              v-tooltip:top="'Info'"
                              class="text-muted"
                            />
                          </button>
                        </div>
                        <liveness-info />
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card v-if="safetyAnalyzed" no-body class="mb-1 border-0">
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <button
                    v-b-toggle.accordion-safety
                    class="btn btn-block btn-outline-primary"
                  >
                    Safety risk
                  </button>
                </b-card-header>
                <b-collapse
                  id="accordion-safety"
                  visible
                  accordion="my-accordion"
                  role="tabpanel"
                >
                  <b-card-body class="px-0 pb-0">
                    <analysis
                      title="Splitting sets"
                      :items="splittingSets"
                      :nodes-partition="nodesPartition"
                      :show-nodes-partition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template #title>
                        <div
                          class="d-flex justify-content-between align-items-baseline"
                        >
                          <h3 v-if="splittingSetsMinSize <= 0">
                            No intersection between quorums found.
                          </h3>
                          <h3 v-else>
                            Found set(s) of size
                            {{ splittingSetsMinSize }}
                            that could impact safety.
                          </h3>
                          <button class="btn btn-sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-safety-info'"
                              v-tooltip:top="'Info'"
                              class="text-muted"
                            />
                          </button>
                        </div>
                        <safety-info />
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card v-if="topTierAnalyzed" no-body class="mb-1 border-0">
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <button
                    v-b-toggle.accordion-top-tier
                    class="btn btn-block btn-outline-primary"
                  >
                    Top tier
                  </button>
                </b-card-header>
                <b-collapse
                  id="accordion-top-tier"
                  visible
                  accordion="my-accordion"
                  role="tabpanel"
                >
                  <b-card-body class="px-0 pb-0">
                    <analysis
                      title="Top tier"
                      :items="topTier"
                      :nodes-partition="nodesPartition"
                      :show-nodes-partition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template #title>
                        <div
                          class="d-flex justify-content-between align-items-baseline"
                        >
                          <h3 class="mb-0">
                            Top tier has size
                            {{ topTier.length }}
                          </h3>

                          <button class="btn btn-sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-top-tier-info'"
                              v-tooltip:top="'Info'"
                              class="text-muted"
                            />
                          </button>
                          <top-tier-info />
                        </div>
                        <b-badge variant="info">
                          {{
                            topTierIsSymmetric ? "Symmetric" : "Not symmetric"
                          }}
                        </b-badge>
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
            </div>
          </div>
        </div>
        <div class="mb-2">
          <b-alert
            :show="!store.network.networkStatistics.hasSymmetricTopTier"
            variant="warning"
            >Warning: top tier is not symmetric, analysis could be slow.
            Execution time increases exponentially with top tier size. For very
            large networks you can export the current network through the
            'modify network' tool and run the analysis offline with the
            <a href="https://github.com/wiberlin/fbas_analyzer" target="_blank"
              >fbas analyzer tool</a
            ></b-alert
          >
          <b-form-group label="Analysis target: ">
            <b-form-checkbox
              v-if="store.selectedNode"
              v-model="analyzeTrustCluster"
              class="pb-1"
            >
              Analyze trust cluster of selected node (Could be slow!)
            </b-form-checkbox>
            <b-form-radio-group
              id="radio-group-2"
              v-model="store.networkAnalysisMergeBy"
              name="radio-sub-component"
            >
              <b-form-radio :value="MyMergeBy.DoNotMerge"
                >{{ getMergeByFriendlyName(MyMergeBy.DoNotMerge) }}
              </b-form-radio>
              <b-form-radio :value="MyMergeBy.Orgs"
                >{{ getMergeByFriendlyName(MyMergeBy.Orgs) }}
              </b-form-radio>
              <b-form-radio :value="MyMergeBy.Countries"
                >{{ getMergeByFriendlyName(MyMergeBy.Countries) }}
              </b-form-radio>
              <b-form-radio :value="MyMergeBy.ISPs"
                >{{ getMergeByFriendlyName(MyMergeBy.ISPs) }}
              </b-form-radio>
            </b-form-radio-group>
          </b-form-group>
          <b-form-group label="Analysis type: ">
            <b-form-checkbox v-model="analyzeQuorumIntersection"
              >Quorum Intersection</b-form-checkbox
            >
            <b-form-checkbox v-model="analyzeLiveness"
              >Liveness</b-form-checkbox
            >
            <b-form-checkbox v-model="analyzeSafety">Safety</b-form-checkbox>
            <b-form-checkbox v-model="analyzeTopTier">Top Tier</b-form-checkbox>
          </b-form-group>

          <button
            v-if="!isLoading"
            class="btn btn-primary btn"
            @click="performAnalysis"
          >
            Perform analysis
          </button>
          <button
            v-else
            class="btn btn-danger"
            variant="danger"
            @click="stopAnalysis"
          >
            Stop analysis
          </button>
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script setup lang="ts">
import {
  BAlert,
  BBadge,
  BCard,
  BCardBody,
  BCardHeader,
  BCollapse,
  BFormCheckbox,
  BFormGroup,
  BFormRadio,
  BFormRadioGroup,
  BIconInfoCircle,
  BIconX,
  VBModal,
  VBToggle,
} from "bootstrap-vue";
import {
  BaseQuorumSet,
  Node,
  TransitiveQuorumSetFinder,
  type PublicKey,
} from "@stellarbeat/js-stellarbeat-shared";
import Analysis from "@/components/network/tools/network-analysis/analysis.vue";
import QuorumIntersectionInfo from "@/components/network/tools/network-analysis/info/quorum-intersection-info.vue";
import SafetyInfo from "@/components/network/tools/network-analysis/info/safety-info.vue";
import LivenessInfo from "@/components/network/tools/network-analysis/info/liveness-info.vue";
import TopTierInfo from "@/components/network/tools/network-analysis/info/top-tier-info.vue";
import { MergeBy } from "@stellarbeat/stellar_analysis_web";
import { type FbasAnalysisWorkerResult } from "@/workers/fbas-analysis-v3.worker";
import Vue, { onMounted, type Ref, ref } from "vue";
import { useIsLoading } from "@/composables/useIsLoading";
import useStore from "@/store/useStore";
import useScrollTo from "@/composables/useScrollTo";

Vue.directive("b-modal", VBModal);
Vue.directive("b-toggle", VBToggle);

const { isLoading, dimmerClass } = useIsLoading();
const store = useStore();

const showModal = ref(false);

const MyMergeBy: {
  DoNotMerge: number;
  Orgs: number;
  ISPs: number;
  Countries: number;
} = MergeBy; //for use in template as enums not supported

const fbasAnalysisWorker = new Worker(
  new URL("./../../../../workers/fbas-analysis-v3.worker.ts", import.meta.url),
  {
    type: import.meta.env.DEV ? "module" : "classic",
    /* @vite-ignore */
  },
);
const scrollTo = useScrollTo();
const hasResult = ref(false);
const resultMergedBy = ref(MyMergeBy.DoNotMerge);
const hasQuorumIntersection = ref(false);
const minimalQuorums: Ref<Array<Array<string>>> = ref([]);
const blockingSets: Ref<Array<Array<string>>> = ref([]);
const blockingSetsMinSize = ref(0);
const splittingSets: Ref<Array<Array<string>>> = ref([]);
const splittingSetsMinSize = ref(0);
const topTier: Ref<Array<Array<string>>> = ref([]);
const topTierIsSymmetric = ref(false);

const analyzeTrustCluster = ref(false);
const analyzeQuorumIntersection = ref(true);
const quorumIntersectionAnalyzed = ref(false);
const analyzeSafety = ref(true);
const safetyAnalyzed = ref(false);
const analyzeLiveness = ref(true);
const livenessAnalyzed = ref(false);
const analyzeTopTier = ref(true);
const topTierAnalyzed = ref(false);

const nodesPartition: Ref<Map<string, string[]>> = ref(
  new Map<string, string[]>(),
);

function getMergeByFriendlyName(mergeBy = MyMergeBy.DoNotMerge) {
  switch (mergeBy) {
    case MyMergeBy.Countries:
      return "Countries";
    case MyMergeBy.DoNotMerge:
      return "Nodes";
    case MyMergeBy.ISPs:
      return "ISP's";
    case MyMergeBy.Orgs:
      return "Organizations";
  }
}

function stopAnalysis() {
  fbasAnalysisWorker.terminate();
  isLoading.value = false;
}

function performAnalysis() {
  const nodesToAnalyze: Node[] = Array.from(
    new Set(
      analyzeTrustCluster.value && store.selectedNode
        ? [
            ...Array.from(
              TransitiveQuorumSetFinder.find(
                store.selectedNode?.quorumSet,
                getNodesToQuorumSetMap(store.network.nodes),
              ),
            ).map((publicKey) => store.network.getNodeByPublicKey(publicKey)),
            store.selectedNode,
          ]
        : store.networkAnalyzer.nodesToAnalyze,
    ),
  );

  isLoading.value = true;
  fbasAnalysisWorker.postMessage({
    id: 1,
    nodes: nodesToAnalyze,
    organizations: store.network.organizations,
    mergeBy: store.networkAnalysisMergeBy,
    failingNodePublicKeys: store.network.nodes
      .filter((node) => store.network.isNodeFailing(node))
      .map((node) => node.publicKey),
    analyzeQuorumIntersection: analyzeQuorumIntersection,
    analyzeSafety: analyzeSafety,
    analyzeLiveness: analyzeLiveness,
    analyzeTopTier: analyzeTopTier,
    analyzeSymmetricTopTier: true,
  });
}

function getNodesToQuorumSetMap(nodes: Node[]): Map<PublicKey, BaseQuorumSet> {
  return new Map<string, BaseQuorumSet>(
    nodes
      .filter((node) => node.quorumSet)
      .map((node: Node) => [node.publicKey, node.quorumSet]),
  );
}

function updatePartitions() {
  //todo should come from fbas analysis
  const removeSpecialCharsFromGroupingName = (name: string) => {
    //copied from fbas analysis, to handle isp naming differences
    name = name.replace(",", "");
    const start = name.substring(0, name.length - 1);
    let end = name.substring(name.length - 1);
    end = end.replace(".", "");
    name = start + end;

    return name;
  };
  nodesPartition.value = new Map<string, string[]>();
  store.network.nodes
    .filter((node) =>
      store.network.nodesTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(
        node.publicKey,
      ),
    )
    .forEach((node) => {
      let value = "N/A";
      if (resultMergedBy.value === MyMergeBy.Countries) {
        value = node.geoData.countryName
          ? removeSpecialCharsFromGroupingName(node.geoData.countryName)
          : "N/A";
      } else if (resultMergedBy.value === MyMergeBy.ISPs) {
        value = node.isp ? removeSpecialCharsFromGroupingName(node.isp) : "N/A";
      } else if (resultMergedBy.value === MyMergeBy.Orgs) {
        value = node.organizationId
          ? store.network.getOrganizationById(node.organizationId).name
          : "N/A";
      }

      const nodes = nodesPartition.value.has(value)
        ? (nodesPartition.value.get(value) as string[])
        : [];
      nodes.push(node.displayName);
      nodesPartition.value.set(value, nodes);
    });
}

function mapPublicKeysToNames(items: Array<Array<PublicKey>>) {
  return items.map((row) =>
    row.map(
      (publicKey) => store.network.getNodeByPublicKey(publicKey).displayName,
    ),
  );
}

onMounted(() => {
  isLoading.value = false;
  scrollTo("network-analysis-card");

  fbasAnalysisWorker.onmessage = (event: {
    data: {
      type: string;
      result: {
        analysis: FbasAnalysisWorkerResult;
        mergeBy: MergeBy;
        jobId: number;
      };
    };
  }) => {
    switch (event.data.type) {
      case "end":
        {
          if (event.data.result) {
            hasResult.value = true;
            resultMergedBy.value = event.data.result.mergeBy;
            updatePartitions();
            const analysisResult: FbasAnalysisWorkerResult =
              event.data.result.analysis;
            topTierIsSymmetric.value = analysisResult.hasSymmetricTopTier;
            quorumIntersectionAnalyzed.value =
              analysisResult.quorumIntersectionAnalyzed;

            if (analysisResult.quorumIntersectionAnalyzed) {
              hasQuorumIntersection.value =
                analysisResult.hasQuorumIntersection as boolean;
              minimalQuorums.value =
                analysisResult.minimalQuorums as string[][];
              if (resultMergedBy.value === MyMergeBy.DoNotMerge)
                minimalQuorums.value = mapPublicKeysToNames(
                  minimalQuorums.value,
                );
            }

            livenessAnalyzed.value = analysisResult.livenessAnalyzed;
            if (analysisResult.livenessAnalyzed) {
              const blockingSetsTemp =
                analysisResult.minimalBlockingSets as string[][];
              if (blockingSetsTemp.length > 0) {
                blockingSetsMinSize.value =
                  analysisResult.minimalBlockingSetsMinSize as number;
                blockingSets.value =
                  analysisResult.minimalBlockingSets as string[][];
                if (resultMergedBy.value === MyMergeBy.DoNotMerge) {
                  blockingSets.value = mapPublicKeysToNames(blockingSets.value);
                }
              }
            }

            safetyAnalyzed.value = analysisResult.safetyAnalyzed;
            if (analysisResult.safetyAnalyzed) {
              const splittingSetsTemp =
                analysisResult.minimalSplittingSets as string[][];
              if (splittingSetsTemp.length > 0) {
                splittingSetsMinSize.value =
                  analysisResult.minimalSplittingSetsMinSize as number;
                splittingSets.value =
                  analysisResult.minimalSplittingSets as string[][];
                if (resultMergedBy.value === MyMergeBy.DoNotMerge)
                  splittingSets.value = mapPublicKeysToNames(
                    splittingSets.value,
                  );
              }
            }

            topTierAnalyzed.value = analysisResult.topTierAnalyzed;
            //@ts-ignore;
            if (analysisResult.topTierAnalyzed) {
              topTier.value = analysisResult.topTier.map((member) => [member]);
              if (resultMergedBy.value === MyMergeBy.DoNotMerge)
                topTier.value = mapPublicKeysToNames(topTier.value);
            }
          }

          isLoading.value = false;
        }
        break;
    }
  };
});
</script>
<style scoped>
.my-thead tr th {
  color: #495057;
  text-transform: none;
  font-size: 0.9375rem;
  font-weight: 700;
}
</style>
