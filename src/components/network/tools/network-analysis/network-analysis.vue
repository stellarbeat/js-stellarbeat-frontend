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
                    variant="outline-primary-sb"
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
                        resultMergedBy !== MergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
                        <div
                          class="
                            d-flex
                            justify-content-between
                            align-items-baseline
                          "
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
                    variant="outline-primary-sb"
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
                        resultMergedBy !== MergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
                        <div
                          class="
                            d-flex
                            justify-content-between
                            align-items-baseline
                          "
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
                    variant="outline-primary-sb"
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
                        resultMergedBy !== MergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
                        <div
                          class="
                            d-flex
                            justify-content-between
                            align-items-baseline
                          "
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
                    variant="outline-primary-sb"
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
                        resultMergedBy !== MergeBy.DoNotMerge
                      "
                    >
                      <template v-slot:title>
                        <div
                          class="
                            d-flex
                            justify-content-between
                            align-items-baseline
                          "
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
            :show="!network.networkStatistics.hasSymmetricTopTier"
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
              <b-form-radio :value="MergeBy.DoNotMerge"
                >{{ getMergeByFriendlyName(MergeBy.DoNotMerge) }}
              </b-form-radio>
              <b-form-radio :value="MergeBy.Orgs"
                >{{ getMergeByFriendlyName(MergeBy.Orgs) }}
              </b-form-radio>
              <b-form-radio :value="MergeBy.Countries"
                >{{ getMergeByFriendlyName(MergeBy.Countries) }}
              </b-form-radio>
              <b-form-radio :value="MergeBy.ISPs"
                >{{ getMergeByFriendlyName(MergeBy.ISPs) }}
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
            variant="primary-sb"
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

<script lang="ts">
import { Component, Mixins } from "vue-property-decorator";
import {
  BAlert,
  BBadge,
  BButton,
  BCard,
  BCardBody,
  BCardFooter,
  BCardHeader,
  BCardText,
  BCollapse,
  BFormCheckbox,
  BFormCheckboxGroup,
  BFormGroup,
  BFormInput,
  BFormRadio,
  BFormRadioGroup,
  BFormSelect,
  BIconInfoCircle,
  BIconX,
  BPagination,
  BTable,
  VBModal,
  VBToggle,
  VBTooltip,
} from "bootstrap-vue";
import { StoreMixin } from "@/mixins/StoreMixin";
import FbasAnalysisWorker from "worker-loader?name=worker/[name].js!../../../../workers/fbas-analysis-v3.worker.ts";
import { IsLoadingMixin } from "@/mixins/IsLoadingMixin";
import { Node, PublicKey } from "@stellarbeat/js-stellar-domain";
import Analysis from "@/components/network/tools/network-analysis/analysis.vue";
import QuorumIntersectionInfo from "@/components/network/tools/network-analysis/info/quorum-intersection-info.vue";
import SafetyInfo from "@/components/network/tools/network-analysis/info/safety-info.vue";
import LivenessInfo from "@/components/network/tools/network-analysis/info/liveness-info.vue";
import TopTierInfo from "@/components/network/tools/network-analysis/info/top-tier-info.vue";
import { MergeBy } from "stellar_analysis";
import { FbasAnalysisWorkerResult } from "@/workers/fbas-analysis-v3.worker";

const _FbasAnalysisWorker: any = FbasAnalysisWorker; // workaround for typescript not compiling web workers.

@Component({
  components: {
    TopTierInfo,
    LivenessInfo,
    SafetyInfo,
    QuorumIntersectionInfo,
    BIconX,
    Analysis,
    BFormInput,
    BButton,
    BAlert,
    BFormCheckbox,
    BFormCheckboxGroup,
    BFormSelect,
    BTable,
    BPagination,
    BBadge,
    BCard,
    BCardBody,
    BCardFooter,
    BCardText,
    BCollapse,
    BCardHeader,
    BIconInfoCircle,
    BFormGroup,
    BFormRadioGroup,
    BFormRadio,
  },
  directives: {
    "b-toggle": VBToggle,
    "b-modal": VBModal,
    "b-tooltip": VBTooltip,
  },
})
export default class NetworkAnalysis extends Mixins(
  StoreMixin,
  IsLoadingMixin
) {
  protected MergeBy: any = MergeBy;
  protected fbasAnalysisWorker = new _FbasAnalysisWorker();
  protected hasResult = false;
  protected resultMergedBy: MergeBy = MergeBy.DoNotMerge;
  protected hasQuorumIntersection = false;
  protected minimalQuorums: Array<Array<string>> = [];
  protected blockingSets: Array<Array<string>> = [];
  protected blockingSetsMinSize = 0;
  protected splittingSets: Array<Array<string>> = [];
  protected splittingSetsMinSize = 0;
  protected topTier: Array<Array<string>> = [];
  protected topTierIsSymmetric = false;

  protected analyzeQuorumIntersection = true;
  protected quorumIntersectionAnalyzed = false;
  protected analyzeSafety = true;
  protected safetyAnalyzed = false;
  protected analyzeLiveness = true;
  protected livenessAnalyzed = false;
  protected analyzeTopTier = true;
  protected topTierAnalyzed = false;

  protected nodesPartition: Map<string, string[]> = new Map<string, string[]>();

  getMergeByFriendlyName(mergeBy = MergeBy.DoNotMerge) {
    switch (mergeBy) {
      case MergeBy.Countries:
        return "Countries";
      case MergeBy.DoNotMerge:
        return "Nodes";
      case MergeBy.ISPs:
        return "ISP's";
      case MergeBy.Orgs:
        return "Organizations";
    }
  }

  get topTierFields() {
    return [
      // A column that needs custom formatting
      {
        key: "topTier",
        label: this.getMergeByFriendlyName(this.resultMergedBy),
      },
    ];
  }

  get correctlyConfiguredNodes() {
    let isNodeCorrectlyConfigured = (node: Node) => {
      return !(
        node.quorumSet.validators.length === 1 &&
        node.publicKey === node.quorumSet.validators[0] &&
        node.quorumSet.innerQuorumSets.length === 0
      );
    };

    return this.network.nodes.filter((node) => isNodeCorrectlyConfigured(node));
  }

  stopAnalysis() {
    this.fbasAnalysisWorker.terminate();
    this.isLoading = false;
  }

  performAnalysis() {
    this.isLoading = true;
    this.fbasAnalysisWorker.postMessage({
      id: 1,
      nodes: this.correctlyConfiguredNodes,
      organizations: this.network.organizations,
      mergeBy: this.store.networkAnalysisMergeBy,
      failingNodePublicKeys: this.network.nodes
        .filter((node) => this.network.isNodeFailing(node))
        .map((node) => node.publicKey),
      analyzeQuorumIntersection: this.analyzeQuorumIntersection,
      analyzeSafety: this.analyzeSafety,
      analyzeLiveness: this.analyzeLiveness,
      analyzeTopTier: this.analyzeTopTier,
      analyzeSymmetricTopTier: true,
    });
  }

  updatePartitions() {
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
    this.nodesPartition = new Map<string, string[]>();
    this.network.nodes
      .filter((node) =>
        this.network.nodesTrustGraph.isVertexPartOfNetworkTransitiveQuorumSet(
          node.publicKey
        )
      )
      .forEach((node) => {
        let value = "N/A";
        if (this.resultMergedBy === MergeBy.Countries) {
          value = node.geoData.countryName
            ? removeSpecialCharsFromGroupingName(node.geoData.countryName)
            : "N/A";
        } else if (this.resultMergedBy === MergeBy.ISPs) {
          value = node.isp
            ? removeSpecialCharsFromGroupingName(node.isp)
            : "N/A";
        } else if (this.resultMergedBy === MergeBy.Orgs) {
          value = node.organizationId
            ? this.network.getOrganizationById(node.organizationId).name
            : "N/A";
        }

        let nodes = this.nodesPartition.has(value)
          ? (this.nodesPartition.get(value) as string[])
          : [];
        nodes.push(node.displayName);
        this.nodesPartition.set(value, nodes);
      });
    console.log(this.nodesPartition);
  }

  mapPublicKeysToNames(items: Array<Array<PublicKey>>) {
    return items.map((row) =>
      row.map(
        (publicKey) => this.network.getNodeByPublicKey(publicKey).displayName
      )
    );
  }

  async mounted() {
    this.isLoading = false;
    this.$nextTick(() => {
      this.$scrollTo("#network-analysis-card");
    });
    this.fbasAnalysisWorker.onmessage = (event: {
      data: { type: string; result: any };
    }) => {
      switch (event.data.type) {
        case "end":
          {
            if (event.data.result) {
              this.hasResult = true;
              this.resultMergedBy = event.data.result.mergeBy;
              this.updatePartitions();
              let analysisResult: FbasAnalysisWorkerResult =
                event.data.result.analysis;
              this.topTierIsSymmetric = analysisResult.hasSymmetricTopTier;
              this.quorumIntersectionAnalyzed =
                analysisResult.quorumIntersectionAnalyzed;

              if (analysisResult.quorumIntersectionAnalyzed) {
                this.hasQuorumIntersection =
                  analysisResult.hasQuorumIntersection as boolean;
                this.minimalQuorums =
                  analysisResult.minimalQuorums as string[][];
                if (this.resultMergedBy === MergeBy.DoNotMerge)
                  this.minimalQuorums = this.mapPublicKeysToNames(
                    this.minimalQuorums
                  );
              }

              this.livenessAnalyzed = analysisResult.livenessAnalyzed;
              if (analysisResult.livenessAnalyzed) {
                let blockingSets =
                  analysisResult.minimalBlockingSets as string[][];
                if (blockingSets.length > 0) {
                  this.blockingSetsMinSize =
                    analysisResult.minimalBlockingSetsMinSize as number;
                  this.blockingSets =
                    analysisResult.minimalBlockingSets as string[][];
                  if (this.resultMergedBy === MergeBy.DoNotMerge) {
                    this.blockingSets = this.mapPublicKeysToNames(
                      this.blockingSets
                    );
                  }
                }
              }

              this.safetyAnalyzed = analysisResult.safetyAnalyzed;
              if (analysisResult.safetyAnalyzed) {
                let splittingSets =
                  analysisResult.minimalSplittingSets as string[][];
                if (splittingSets.length > 0) {
                  this.splittingSetsMinSize =
                    analysisResult.minimalSplittingSetsMinSize as number;
                  this.splittingSets =
                    analysisResult.minimalSplittingSets as string[][];
                  if (this.resultMergedBy === MergeBy.DoNotMerge)
                    this.splittingSets = this.mapPublicKeysToNames(
                      this.splittingSets
                    );
                }
              }

              this.topTierAnalyzed = analysisResult.topTierAnalyzed;
              //@ts-ignore;
              if (analysisResult.topTierAnalyzed) {
                this.topTier = analysisResult.topTier.map((member) => [member]);
                if (this.resultMergedBy === MergeBy.DoNotMerge)
                  this.topTier = this.mapPublicKeysToNames(this.topTier);
              }
            }

            this.isLoading = false;
          }
          break;
      }
    };
  }
}
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
