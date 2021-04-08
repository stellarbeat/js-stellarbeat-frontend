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
                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-quorum variant="outline-primary-sb">Quorum
                                        intersection
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-quorum" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="minimalQuorumFields" :merged-items="minimalQuorumsMerged"
                                                  :items="minimalQuorums" :merged="resultIsMerged">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3>
                                                        <b-badge
                                                                :variant="hasQuorumIntersection ? 'success' : 'danger'">
                                                            {{hasQuorumIntersection ? 'All quorums intersect' : 'No quorum intersection'}}
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
                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-liveness variant="outline-primary-sb">Liveness
                                        risk
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-liveness" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="blockingSetsFields" :merged-items="blockingSetsMerged"
                                                  :items="blockingSets" :merged="resultIsMerged">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3 v-if="blockingSetsMergedMinLength <=0">
                                                        Network halted.
                                                    </h3>
                                                    <h3 v-else>
                                                        Found set(s) of size {{blockingSetsMergedMinLength}}
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
                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-0" role="tab">
                                    <b-button block v-b-toggle.accordion-safety variant="outline-primary-sb">Safety risk
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-safety" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body class="px-0 pb-0">
                                        <analysis :fields="splittingSetsFields" :merged-items="splittingSetsMerged"
                                                  :items="splittingSets" :merged="resultIsMerged">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3 v-if="splittingSetsMergedMinLength <= 0">No intersection between quorums found.</h3>
                                                    <h3 v-else>
                                                        Found set(s) of size {{splittingSetsMergedMinLength}}
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
                                        <analysis :fields="topTierFields" :merged-items="topTier"
                                                  :items="topTier" :merged="resultIsMerged">
                                            <template v-slot:title>
                                                <div class="d-flex justify-content-between align-items-baseline">
                                                    <h3 class="mb-0">
                                                        Top tier has size {{topTier.length}}
                                                    </h3>


                                                    <b-button size="sm" @click="showModal=true">
                                                        <b-icon-info-circle v-b-modal="'network-analysis-top-tier-info'"
                                                                            v-b-tooltip:hover.top="'Info'"
                                                                            class="text-muted"/>
                                                    </b-button>
                                                    <top-tier-info/>
                                                </div>
                                                <b-badge variant="info">{{topTierIsSymmetric ? 'Symmetric' : 'Not symmetric'}}</b-badge>
                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                        </div>
                    </div>
                </div>
                <div class="mb-2">

                    <b-alert show variant="warning" v-if="!mergeByOrganizations && network.nodes.length > 20">
                        Warning: computing node results will be slow when simulating non symmetric top tiers.
                    </b-alert>
                    <b-form-checkbox v-model="mergeByOrganizations" v-show="false"
                                     class="sb-nav-item sb-nav-toggle mb-2"
                                     switch>
                        Merge by organizations
                    </b-form-checkbox>

                    <b-form-group label="Analysis target: " v-slot="{ ariaDescribedby }">
                        <b-form-radio-group
                            id="radio-group-2"
                            v-model="mergeBySelected"
                            :aria-describedby="ariaDescribedby"
                            name="radio-sub-component"
                        >
                            <b-form-radio :value="MergeBy.DoNotMerge">Nodes</b-form-radio>
                            <b-form-radio :value="MergeBy.Organizations">Organizations</b-form-radio>
                            <b-form-radio :value="MergeBy.Countries" >Countries</b-form-radio>
                            <b-form-radio :value="MergeBy.ISPs">ISP's</b-form-radio>
                        </b-form-radio-group>
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
        BIconX,
        BFormInput,
        BAlert,
        BButton,
        BFormCheckbox,
        BFormSelect,
        BTable,
        BPagination,
        BBadge,
        BCard,
        BCardBody,
        BCardFooter,
        BCardText,
        BCollapse,
        VBToggle,
        BCardHeader,
        BIconInfoCircle, VBModal, VBTooltip,
        BFormGroup,
        BFormRadio,
        BFormRadioGroup
    } from 'bootstrap-vue';
    import {StoreMixin} from '@/mixins/StoreMixin';
    import FbasAnalysisWorker from 'worker-loader?name=worker/[name].js!./../../../../workers/fbas-analysis-v2.worker.ts';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import {Node, PublicKey} from '@stellarbeat/js-stellar-domain';
    import Analysis from '@/components/network/tools/network-analysis/analysis.vue';
    import QuorumIntersectionInfo from '@/components/network/tools/network-analysis/info/quorum-intersection-info.vue';
    import SafetyInfo from '@/components/network/tools/network-analysis/info/safety-info.vue';
    import LivenessInfo from '@/components/network/tools/network-analysis/info/liveness-info.vue';
    import TopTierInfo from '@/components/network/tools/network-analysis/info/top-tier-info.vue';
    import {MergeBy} from "stellar_analysis";

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
        protected mergeBySelected:MergeBy = MergeBy.DoNotMerge;
        protected MergeBy:any = MergeBy;
        protected fbasAnalysisWorker = new _FbasAnalysisWorker();
        protected mergeByOrganizations: boolean = this.$root.$data.store.network.nodes.length > 20;
        protected hasResult: boolean = false;
        protected resultIsMerged: boolean = true;
        protected hasQuorumIntersection: boolean = false;
        protected minimalQuorums: { value: PublicKey[], text: string }[] = [];
        protected minimalQuorumsMerged: { value: string[], text: string }[] = [];
        protected minimalQuorumFields: any = [
            // A column that needs custom formatting
            {key: 'minimalQuorums', label: 'Minimal quorums'}
        ];


        protected blockingSets: { value: PublicKey[], text: string }[] = [];
        protected blockingSetsMinLength: number = 0;
        protected blockingSetsMerged: { value: string[], text: string }[] = [];
        protected blockingSetsMergedMinLength: number = 0;
        protected blockingSetsFields: any = [
            // A column that needs custom formatting
            {key: 'blockingSets', label: 'Minimal blocking sets'}
        ];

        protected splittingSets: { value: PublicKey[], text: string }[] = [];
        protected splittingSetsMinLength: number = 0;
        protected splittingSetsMerged: { value: string[], text: string }[] = [];
        protected splittingSetsMergedMinLength: number = 0;
        protected splittingSetsFields: any = [
            // A column that needs custom formatting
            {key: 'splittingSets', label: 'Minimal splitting sets'}
        ];

        protected topTier: string[] = [];
        protected topTierIsSymmetric: boolean = false;

        get topTierFields() {
            return [
                // A column that needs custom formatting
                {key: 'topTier', label: this.resultIsMerged ? 'Organizations' : 'Validators'}
            ];
        }

        performAnalysis() {
            this.isLoading = true;
            this.fbasAnalysisWorker.postMessage({
                nodes: this.network.nodes,
                organizations: this.network.organizations,
                mergeBy: this.mergeBySelected,
                failingNodePublicKeys: this.network.nodes.filter(node => this.network.isNodeFailing(node)).map(node => node.publicKey)
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
                            this.resultIsMerged = true;//event.data.result.mergeBy !== MergeBy.DoNotMerge;
                            this.hasQuorumIntersection = event.data.result.analysis.has_intersection;
                            this.minimalQuorumsMerged = JSON.parse(event.data.result.analysis.minimal_quorums)
                                .map((quorum: string[]) => {
                                    return {
                                        'minimalQuorums': quorum.join(', ')
                                    };
                                });
                            let blockingSetsMerged = JSON.parse(event.data.result.analysis.minimal_blocking_sets);
                            if (blockingSetsMerged.length > 0) {
                                this.blockingSetsMergedMinLength = blockingSetsMerged[0].length;
                                this.blockingSetsMerged = blockingSetsMerged
                                    .map((blockingSet: string[]) => {
                                        return {
                                            'blockingSets': blockingSet.join(', ')
                                        };
                                    });
                            }
                            let splittingSetsMerged = JSON.parse(event.data.result.analysis.minimal_splitting_sets);
                            if (splittingSetsMerged.length > 0) {
                                this.splittingSetsMergedMinLength = splittingSetsMerged[0].length;
                                this.splittingSetsMerged = splittingSetsMerged
                                    .map((splittingSet: string[]) => {
                                        return {
                                            'splittingSets': splittingSet.join(', ')
                                        };
                                    });
                            }

                            this.topTier = event.data.result.analysis.top_tier.map((top:string) => {
                                return {
                                    'topTier': top
                                }
                            });
                            this.topTierIsSymmetric = event.data.result.analysis.symmetric_top_tier_exists;
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