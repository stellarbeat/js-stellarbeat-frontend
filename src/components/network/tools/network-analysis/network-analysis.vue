<template>
    <b-card no-body>
        <b-card-header class="p-3">
            <h3 class="card-title">Network analysis</h3>
            <div class="card-options">
                <a href="#" v-on:click.prevent.stop="store.isNetworkAnalysisVisible = false" class="card-options-remove"
                   data-toggle="card-remove">
                    <b-icon-x class="mr-2"/>
                </a>
            </div>
        </b-card-header>
        <b-card-body class="px-3 pt-4 pb-2">
            <div v-bind:class="dimmerClass">
                <div class="loader mt-2"></div>
                <div class="dimmer-content">
                    <div v-if="hasResult">
                        <div class="accordion" role="tablist">
                            <b-card v-if="quorumIntersectionAnalyzed" no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-quorum variant="outline-primary-sb">Quorum
                                        intersection
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-quorum" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="minimalQuorumFields"
                                                  :items="minimalQuorums">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3>
                                                        <b-badge
                                                            :variant="hasQuorumIntersection ? 'success' : 'danger'">
                                                            {{ hasQuorumIntersection ? 'All quorums intersect' : 'No quorum intersection' }}
                                                        </b-badge>
                                                    </h3>
                                                    <b-button size="sm" @click="showModal=true">
                                                        <b-icon-info-circle v-b-modal="'network-analysis-qi-info'"
                                                                            v-b-tooltip:hover.top="'Info'"
                                                                            class="text-muted"/>
                                                    </b-button>
                                                    <quorum-intersection-info/>
                                                </div>
                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                            <b-card v-if="livenessAnalyzed" no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-liveness variant="outline-primary-sb">Liveness
                                        risk
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-liveness" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="blockingSetsFields"
                                                  :items="blockingSets">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3 v-if="blockingSetsMinSize <=0 ">
                                                        Network halted.
                                                    </h3>
                                                    <h3 v-else>
                                                        Found set(s) of size {{ blockingSetsMinSize }}
                                                        that could
                                                        impact liveness.
                                                    </h3>
                                                    <b-button size="sm" @click="showModal=true">
                                                        <b-icon-info-circle v-b-modal="'network-analysis-liveness-info'"
                                                                            v-b-tooltip:hover.top="'Info'"
                                                                            class="text-muted"/>
                                                    </b-button>
                                                </div>
                                                <liveness-info/>
                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                            <b-card v-if="safetyAnalyzed" no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-safety variant="outline-primary-sb">Safety risk
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-safety" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="splittingSetsFields"
                                                  :items="splittingSets">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3 v-if="splittingSetsMinSize <= 0">No intersection between quorums
                                                        found.</h3>
                                                    <h3 v-else>
                                                        Found set(s) of size {{ splittingSetsMinSize }}
                                                        that could
                                                        impact safety.
                                                    </h3>
                                                    <b-button size="sm" @click="showModal=true">
                                                        <b-icon-info-circle v-b-modal="'network-analysis-safety-info'"
                                                                            v-b-tooltip:hover.top="'Info'"
                                                                            class="text-muted"/>
                                                    </b-button>
                                                </div>
                                                <safety-info/>
                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>

                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-top-tier variant="outline-primary-sb">Top tier
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-top-tier" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="topTierFields"
                                                  :items="topTier">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3 class="mb-0">
                                                        Top tier has size {{ topTier.length }}
                                                    </h3>


                                                    <b-button size="sm" @click="showModal=true">
                                                        <b-icon-info-circle v-b-modal="'network-analysis-top-tier-info'"
                                                                            v-b-tooltip:hover.top="'Info'"
                                                                            class="text-muted"/>
                                                    </b-button>
                                                    <top-tier-info/>
                                                </div>
                                                <b-badge variant="info">
                                                    {{ topTierIsSymmetric ? 'Symmetric' : 'Not symmetric' }}
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

                    <b-form-group label="Analysis target: " v-slot="{ ariaDescribedby }">
                        <b-form-radio-group
                            id="radio-group-2"
                            v-model="selectedMergeBy"
                            :aria-describedby="ariaDescribedby"
                            name="radio-sub-component"
                        >
                            <b-form-radio :value="MergeBy.DoNotMerge">{{ getMergeByFriendlyName(MergeBy.DoNotMerge) }}
                            </b-form-radio>
                            <b-form-radio :value="MergeBy.Orgs">{{ getMergeByFriendlyName(MergeBy.Orgs) }}
                            </b-form-radio>
                            <b-form-radio :value="MergeBy.Countries">{{ getMergeByFriendlyName(MergeBy.Countries) }}
                            </b-form-radio>
                            <b-form-radio :value="MergeBy.ISPs">{{ getMergeByFriendlyName(MergeBy.ISPs) }}
                            </b-form-radio>
                        </b-form-radio-group>
                    </b-form-group>
                    <b-form-group label="Analysis type: " v-slot="{ ariaDescribedby }">
                        <b-form-checkbox v-model="analyzeQuorumIntersection">Quorum Intersection</b-form-checkbox>
                        <b-form-checkbox v-model="analyzeLiveness">Liveness</b-form-checkbox>
                        <b-form-checkbox v-model="analyzeSafety">Safety</b-form-checkbox>
                    </b-form-group>

                    <b-button variant="primary-sb" v-on:click="performAnalysis">Perform analysis</b-button>
                </div>
            </div>
        </b-card-body>
    </b-card>
</template>

<script lang="ts">
import {Component, Mixins} from 'vue-property-decorator';
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
    BFormGroup,
    BFormInput,
    BFormRadio,
    BFormRadioGroup,
    BFormSelect,
    BIconInfoCircle,
    BIconX,
    BPagination,
    BTable,
    BFormCheckboxGroup,
    VBModal,
    VBToggle,
    VBTooltip
} from 'bootstrap-vue';
import {StoreMixin} from '@/mixins/StoreMixin';
import FbasAnalysisWorker from 'worker-loader?name=worker/[name].js!../../../../workers/fbas-analysis-v3.worker.ts';
import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
import {Node, PublicKey} from '@stellarbeat/js-stellar-domain';
import Analysis from '@/components/network/tools/network-analysis/analysis.vue';
import QuorumIntersectionInfo from '@/components/network/tools/network-analysis/info/quorum-intersection-info.vue';
import SafetyInfo from '@/components/network/tools/network-analysis/info/safety-info.vue';
import LivenessInfo from '@/components/network/tools/network-analysis/info/liveness-info.vue';
import TopTierInfo from '@/components/network/tools/network-analysis/info/top-tier-info.vue';
import {MergeBy} from 'stellar_analysis';
import {FbasAnalysisWorkerResult} from '@/workers/fbas-analysis-v3.worker';

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
        BFormRadio
    },
    directives: {'b-toggle': VBToggle, 'b-modal': VBModal, 'b-tooltip': VBTooltip}
})
export default class NetworkAnalysis extends Mixins(StoreMixin, IsLoadingMixin) {
    protected selectedMergeBy: MergeBy = MergeBy.DoNotMerge;
    protected MergeBy: any = MergeBy;
    protected fbasAnalysisWorker = new _FbasAnalysisWorker();
    protected hasResult: boolean = false;
    protected resultMergedBy: MergeBy = MergeBy.DoNotMerge;
    protected hasQuorumIntersection: boolean = false;
    protected minimalQuorums: { value: PublicKey[], text: string }[] = [];
    protected minimalQuorumFields: any = [
        // A column that needs custom formatting
        {key: 'minimalQuorums', label: 'Minimal quorums'}
    ];

    protected blockingSets: { value: PublicKey[], text: string }[] = [];
    protected blockingSetsMinSize: number = 0;
    protected blockingSetsFields: any = [
        // A column that needs custom formatting
        {key: 'blockingSets', label: 'Minimal blocking sets'}
    ];

    protected splittingSets: { value: PublicKey[], text: string }[] = [];
    protected splittingSetsMinSize: number = 0;
    protected splittingSetsFields: any = [
        // A column that needs custom formatting
        {key: 'splittingSets', label: 'Minimal splitting sets'}
    ];

    protected topTier: {topTier: string}[] = [];
    protected topTierIsSymmetric: boolean = false;

    protected analyzeQuorumIntersection: boolean = true;
    protected quorumIntersectionAnalyzed:boolean = false;
    protected analyzeSafety: boolean = true;
    protected safetyAnalyzed: boolean = false;
    protected analyzeLiveness: boolean = true;
    protected livenessAnalyzed: boolean = false;

    getMergeByFriendlyName(mergeBy = MergeBy.DoNotMerge) {
        switch (mergeBy) {
            case MergeBy.Countries:
                return 'Countries';
            case MergeBy.DoNotMerge:
                return 'Nodes';
            case MergeBy.ISPs:
                return 'ISP\'s';
            case MergeBy.Orgs:
                return 'Organizations';
        }
    }

    get topTierFields() {
        return [
            // A column that needs custom formatting
            {key: 'topTier', label: this.getMergeByFriendlyName(this.resultMergedBy)}
        ];
    }

    get correctlyConfiguredNodes() {
        let isNodeCorrectlyConfigured = (node: Node) => {
            return !(node.quorumSet.validators.length === 1
                && node.publicKey === node.quorumSet.validators[0]
                && node.quorumSet.innerQuorumSets.length === 0);
        };

        return this.network.nodes.filter(node => isNodeCorrectlyConfigured(node));
    }

    performAnalysis() {
        this.isLoading = true;
        this.fbasAnalysisWorker.postMessage({
            id: 1,
            nodes: this.correctlyConfiguredNodes,
            organizations: this.network.organizations,
            mergeBy: this.selectedMergeBy,
            failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey),
            analyzeQuorumIntersection: this.analyzeQuorumIntersection,
            analyzeSafety: this.analyzeSafety,
            analyzeLiveness: this.analyzeLiveness,
            analyzeTopTier: true
        });
    }

    async mounted() {
        this.isLoading = false;
        this.$nextTick(() => {
            this.$scrollTo('#network-analysis-card');
        });
        this.fbasAnalysisWorker.onmessage = (
            event: { data: { type: string, result: any } }
        ) => {
            switch (event.data.type) {
                case 'tick': {

                }
                    break;
                case 'end': {
                    if (event.data.result) {
                        this.hasResult = true;
                        this.resultMergedBy = event.data.result.mergeBy;
                        let analysisResult: FbasAnalysisWorkerResult = event.data.result.analysis;
                        this.quorumIntersectionAnalyzed = analysisResult.quorumIntersectionAnalyzed;
                        if (analysisResult.quorumIntersectionAnalyzed) {
                            this.hasQuorumIntersection = analysisResult.hasQuorumIntersection!;
                            //@ts-ignore
                            this.minimalQuorums = analysisResult.minimalQuorums!.map((quorum: string[]) => {
                                if (this.resultMergedBy === MergeBy.DoNotMerge)
                                    quorum = quorum.map(publicKey => this.network.getNodeByPublicKey(publicKey).displayName);
                                return {
                                    'minimalQuorums': quorum.join(', ')
                                };
                            });
                        }

                        this.livenessAnalyzed = analysisResult.livenessAnalyzed;
                        if (analysisResult.livenessAnalyzed) {
                            let blockingSets = analysisResult.minimalBlockingSets!;
                            if (blockingSets.length > 0) {
                                this.blockingSetsMinSize = analysisResult.minimalBlockingSetsMinSize!;
                                //@ts-ignore
                                this.blockingSets = blockingSets
                                    .map((blockingSet: string[]) => {
                                        if (this.resultMergedBy === MergeBy.DoNotMerge)
                                            blockingSet = blockingSet.map(publicKey => this.network.getNodeByPublicKey(publicKey).displayName);
                                        return {
                                            'blockingSets': blockingSet.join(', ')
                                        };
                                    });
                            }
                        }

                        this.safetyAnalyzed = analysisResult.safetyAnalyzed;
                        if (analysisResult.safetyAnalyzed) {
                            let splittingSets = analysisResult.minimalSplittingSets!;
                            if (splittingSets.length > 0) {
                                this.splittingSetsMinSize = analysisResult.minimalSplittingSetsMinSize!;
                                //@ts-ignore
                                this.splittingSets = splittingSets
                                    .map((splittingSet: string[]) => {
                                        if (this.resultMergedBy === MergeBy.DoNotMerge)
                                            splittingSet = splittingSet.map(publicKey => this.network.getNodeByPublicKey(publicKey).displayName);
                                        return {
                                            'splittingSets': splittingSet.join(', ')
                                        };
                                    });
                            }
                        }

                        //@ts-ignore;
                        this.topTier = analysisResult.topTier.map((top: string) => {
                            if (this.resultMergedBy === MergeBy.DoNotMerge)
                                top = this.network.getNodeByPublicKey(top).displayName;
                            return {
                                'topTier': top
                            };
                        });
                        this.topTierIsSymmetric = analysisResult.hasSymmetricTopTier;
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