<template>
  <b-card no-body>
    <b-card-header class="p-3">
      <h3 class="card-title">Network analysis</h3>
      <div class="card-options">
        <a
          href="#"
          v-on:click.prevent.stop="store.isNetworkAnalysisVisible = false"
          class="card-options-remove"
          data-toggle="card-remove"
        >
          <b-icon-x class="mr-2" />
        </a>
      </div>
    </b-card-header>
    <b-card-body class="px-3 pt-4 pb-2">
      <div v-bind:class="dimmerClass">
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
                  <b-button
                    block
                    v-b-toggle.accordion-quorum
                    variant="outline-primary"
                    >Quorum intersection
                  </b-button>
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
                      :nodesPartition="nodesPartition"
                      :showNodesPartition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
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
                          <b-button size="sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-qi-info'"
                              v-b-tooltip:hover.top="'Info'"
                              class="text-muted"
                            />
                          </b-button>
                          <quorum-intersection-info />
                        </div>
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card v-if="livenessAnalyzed" no-body class="mb-1 border-0">
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <b-button
                    block
                    v-b-toggle.accordion-liveness
                    variant="outline-primary"
                    >Liveness risk
                  </b-button>
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
                      :nodesPartition="nodesPartition"
                      :showNodesPartition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
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
                          <b-button size="sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-liveness-info'"
                              v-b-tooltip:hover.top="'Info'"
                              class="text-muted"
                            />
                          </b-button>
                        </div>
                        <liveness-info />
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card v-if="safetyAnalyzed" no-body class="mb-1 border-0">
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <b-button
                    block
                    v-b-toggle.accordion-safety
                    variant="outline-primary"
                    >Safety risk
                  </b-button>
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
                      :nodesPartition="nodesPartition"
                      :showNodesPartition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
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
                          <b-button size="sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-safety-info'"
                              v-b-tooltip:hover.top="'Info'"
                              class="text-muted"
                            />
                          </b-button>
                        </div>
                        <safety-info />
                      </template>
                    </analysis>
                  </b-card-body>
                </b-collapse>
              </b-card>
              <b-card v-if="topTierAnalyzed" no-body class="mb-1 border-0">
                <b-card-header header-tag="header" class="p-0" role="tab">
                  <b-button
                    block
                    v-b-toggle.accordion-top-tier
                    variant="outline-primary"
                    >Top tier
                  </b-button>
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
                      :nodesPartition="nodesPartition"
                      :showNodesPartition="
                        resultMergedBy !== MyMergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
                        <div
                          class="d-flex justify-content-between align-items-baseline"
                        >
                          <h3 class="mb-0">
                            Top tier has size
                            {{ topTier.length }}
                          </h3>

                          <b-button size="sm" @click="showModal = true">
                            <b-icon-info-circle
                              v-b-modal="'network-analysis-top-tier-info'"
                              v-b-tooltip:hover.top="'Info'"
                              class="text-muted"
                            />
                          </b-button>
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

          <b-button
            v-if="!isLoading"
            variant="primary"
            v-on:click="performAnalysis"
            >Perform analysis
          </b-button>
          <b-button v-else variant="danger" v-on:click="stopAnalysis"
            >Stop analysis</b-button
          >
        </div>
      </div>
    </b-card-body>
  </b-card>
</template>

<script setup lang="ts">
import {
  BAlert,
  BBadge,
  BButton,
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
  VBTooltip,
} from "bootstrap-vue";
import { PublicKey } from "@stellarbeat/js-stellarbeat-shared";
import Analysis from "@/components/network/tools/network-analysis/analysis.vue";
import QuorumIntersectionInfo from "@/components/network/tools/network-analysis/info/quorum-intersection-info.vue";
import SafetyInfo from "@/components/network/tools/network-analysis/info/safety-info.vue";
import LivenessInfo from "@/components/network/tools/network-analysis/info/liveness-info.vue";
import TopTierInfo from "@/components/network/tools/network-analysis/info/top-tier-info.vue";
import { MergeBy } from "@stellarbeat/stellar_analysis_web";
import { FbasAnalysisWorkerResult } from "@/workers/fbas-analysis-v3.worker";
import Vue, { nextTick, onMounted, Ref, ref } from "vue";
import { useIsLoading } from "@/composables/useIsLoading";
import useStore from "@/store/useStore";
import VueScrollTo from "vue-scrollto";
Vue.directive("b-modal", VBModal);
Vue.directive("b-toggle", VBToggle);
Vue.directive("b-tooltip", VBTooltip);

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
  new URL("./../../../../workers/fbas-analysis-v3.worker.ts", import.meta.url)
);
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

const analyzeQuorumIntersection = ref(true);
const quorumIntersectionAnalyzed = ref(false);
const analyzeSafety = ref(true);
const safetyAnalyzed = ref(false);
const analyzeLiveness = ref(true);
const livenessAnalyzed = ref(false);
const analyzeTopTier = ref(true);
const topTierAnalyzed = ref(false);

const nodesPartition: Ref<Map<string, string[]>> = ref(
  new Map<string, string[]>()
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
  isLoading.value = true;
  fbasAnalysisWorker.postMessage({
    id: 1,
    nodes: store.networkAnalyzer.nodesToAnalyze,
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

function updatePartitions() {
  //todo should come from fbas analysis
  let removeSpecialCharsFromGroupingName = (name: string) => {
    //copied from fbas analysis, to handle isp naming differences
    name = name.replace(",", "");
    let start = name.substring(0, name.length - 1);
    let end = name.substring(name.length - 1);
    end = end.replace(".", "");
    name = start + end;

    return name;
  };
  nodesPartition.value = new Map<string, string[]>();
  store.network.nodes
    .filter((node) =>
      store.network.nodesTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(
        node.publicKey
      )
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

      let nodes = nodesPartition.value.has(value)
        ? (nodesPartition.value.get(value) as string[])
        : [];
      nodes.push(node.displayName);
      nodesPartition.value.set(value, nodes);
    });
}

function mapPublicKeysToNames(items: Array<Array<PublicKey>>) {
  return items.map((row) =>
    row.map(
      (publicKey) => store.network.getNodeByPublicKey(publicKey).displayName
    )
  );
}

onMounted(() => {
  isLoading.value = false;
  nextTick(() => {
    VueScrollTo.scrollTo("#network-analysis-card");
  });
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
            let analysisResult: FbasAnalysisWorkerResult =
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
                  minimalQuorums.value
                );
            }

            livenessAnalyzed.value = analysisResult.livenessAnalyzed;
            if (analysisResult.livenessAnalyzed) {
              let blockingSetsTemp =
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
              let splittingSetsTemp =
                analysisResult.minimalSplittingSets as string[][];
              if (splittingSetsTemp.length > 0) {
                splittingSetsMinSize.value =
                  analysisResult.minimalSplittingSetsMinSize as number;
                splittingSets.value =
                  analysisResult.minimalSplittingSets as string[][];
                if (resultMergedBy.value === MyMergeBy.DoNotMerge)
                  splittingSets.value = mapPublicKeysToNames(
                    splittingSets.value
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
<style>
.my-thead tr th {
  color: #495057;
  text-transform: none;
  font-size: 0.9375rem;
  font-weight: 700;
}

.my-tbody tr td {
}
</style>
