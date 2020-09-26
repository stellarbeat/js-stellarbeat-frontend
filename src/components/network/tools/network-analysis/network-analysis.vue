<template>
    <div class="">
        <b-modal lazy ok-title="Close" ok-variant="light"
                 ok-only size="xl" id="network-analysis-modal"
                 title="Network analysis (beta)"
        >
            <div v-bind:class="dimmerClass">
                <div class="loader mt-2"></div>
                <div class="dimmer-content">
                    <div class="mb-2">
                        <b-button variant="primary" v-on:click="performAnalysis">Perform analysis</b-button>
                    </div>
                    <div v-if="hasResult">
                        <div class="accordion" role="tablist">
                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.accordion-quorum variant="outline-primary">Quorum intersection
                                    </b-button>
                                </b-card-header>
                                <b-collapse id="accordion-quorum" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body>
                                        <analysis :fields="minimalQuorumFields" :merged-items="minimalQuorumsMerged"
                                                  :items="minimalQuorums">
                                            <template v-slot:title>
                                                <h3>
                                                    <b-badge :variant="hasQuorumIntersection ? 'success' : 'danger'">
                                                        {{hasQuorumIntersection ? 'All quorums intersect' : 'No quorum intersection'}}
                                                    </b-badge>
                                                </h3>

                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.accordion-liveness variant="outline-primary">Liveness</b-button>
                                </b-card-header>
                                <b-collapse id="accordion-liveness" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body>
                                        <analysis :fields="blockingSetsFields" :merged-items="blockingSetsMerged"
                                                  :items="blockingSets">
                                            <template v-slot:title>
                                                <h3>
                                                    Found set(s) of {{blockingSetsMinLength}} nodes across
                                                    {{blockingSetsMergedMinLength}} organizations that could
                                                    impact liveness.
                                                </h3>
                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                            <b-card no-body class="mb-1 border-0">
                                <b-card-header header-tag="header" class="p-1" role="tab">
                                    <b-button block v-b-toggle.accordion-safety variant="outline-primary">Safety</b-button>
                                </b-card-header>
                                <b-collapse id="accordion-safety" visible accordion="my-accordion" role="tabpanel">
                                    <b-card-body>
                                        <analysis :fields="splittingSetsFields" :merged-items="splittingSetsMerged"
                                                  :items="splittingSets">
                                            <template v-slot:title>
                                                <h3>
                                                    Found set(s) of {{splittingSetsMinLength}} nodes across
                                                    {{splittingSetsMergedMinLength}} organizations that could
                                                    impact safety.
                                                </h3>
                                            </template>
                                        </analysis>
                                    </b-card-body>
                                </b-collapse>
                            </b-card>
                        </div>
                    </div>
                </div>
            </div>
            <template v-slot:modal-footer>
                <div class="w-100">
                    <p class="float-left">Powered by <a target="_blank"
                                                        href="https://github.com/wiberlin/fbas_analyzer">wiberlin/fbas_analyzer</a>
                    </p>
                    <b-button
                            variant="primary"
                            size="sm"
                            class="float-right"
                            @click="showModal=false"
                    >
                        Close
                    </b-button>
                </div>
            </template>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import {Component, Mixins} from 'vue-property-decorator';
    import {
        BFormInput,
        BModal,
        BButton,
        BFormCheckbox,
        BFormSelect,
        BTable,
        BPagination,
        BBadge,
        BCard,
        BCardBody,
        BCardText,
        BCollapse,
        VBToggle,
        BCardHeader
    } from 'bootstrap-vue';
    import {StoreMixin} from '@/mixins/StoreMixin';
    import FbasAnalysisWorker
        from 'worker-loader?name=dist/[name].js!./../../../../workers/fbas-analysis-v1.worker.ts';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import {Node, PublicKey} from '@stellarbeat/js-stellar-domain';
    import Analysis from '@/components/network/tools/network-analysis/analysis.vue';

    const _FbasAnalysisWorker: any = FbasAnalysisWorker; // workaround for typescript not compiling web workers.

    @Component({
        components: {
            Analysis,
            BFormInput,
            BModal,
            BButton,
            BFormCheckbox,
            BFormSelect,
            BTable,
            BPagination,
            BBadge,
            BCard,
            BCardBody,
            BCardText,
            BCollapse,
            BCardHeader
        },
        directives: {'b-toggle': VBToggle}
    })
    export default class NetworkAnalysis extends Mixins(StoreMixin, IsLoadingMixin) {
        protected fbasAnalysisWorker = new _FbasAnalysisWorker();

        protected hasResult: boolean = false;
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

        performAnalysis() {
            this.isLoading = true;
            this.fbasAnalysisWorker.postMessage({
                nodes: this.network.nodes,
                organizations: this.network.organizations
            });
        }

        async mounted() {
            this.isLoading = false;
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
                            this.hasQuorumIntersection = event.data.result.nodesAnalysis.has_intersection;
                            this.minimalQuorums = JSON.parse(event.data.result.nodesAnalysis.minimal_quorums)
                                .map((quorum: PublicKey[]) => {
                                    let quorumPretty = quorum.map(publicKey => this.network.getNodeByPublicKey(publicKey)!.displayName).join(', ');
                                    return {
                                        'minimalQuorums': quorumPretty
                                    };
                                });
                            this.minimalQuorumsMerged = JSON.parse(event.data.result.organizationAnalysis.minimal_quorums)
                                .map((quorum: string[]) => {
                                    return {
                                        'minimalQuorums': quorum.join(', ')
                                    };
                                });

                            let blockingSets = JSON.parse(event.data.result.nodesAnalysis.minimal_blocking_sets);
                            if (blockingSets.length > 0) {
                                this.blockingSetsMinLength = blockingSets[0].length;
                                this.blockingSets = blockingSets
                                    .map((blockingSet: PublicKey[]) => {
                                        let blockingSetPretty = blockingSet.map(publicKey => this.network.getNodeByPublicKey(publicKey)!.displayName).join(', ');
                                        return {
                                            'blockingSets': blockingSetPretty
                                        };
                                    });
                            }
                            let blockingSetsMerged = JSON.parse(event.data.result.organizationAnalysis.minimal_blocking_sets);
                            if (blockingSetsMerged.length > 0) {
                                this.blockingSetsMergedMinLength = blockingSetsMerged[0].length;
                                this.blockingSetsMerged = blockingSetsMerged
                                    .map((blockingSet: string[]) => {
                                        return {
                                            'blockingSets': blockingSet.join(', ')
                                        };
                                    });
                            }

                            let splittingSets = JSON.parse(event.data.result.nodesAnalysis.minimal_splitting_sets);
                            if (splittingSets.length > 0) {
                                this.splittingSetsMinLength = splittingSets[0].length;
                                this.splittingSets = splittingSets
                                    .map((splittingSet: PublicKey[]) => {
                                        let splittingSetPretty = splittingSet.map(publicKey => this.network.getNodeByPublicKey(publicKey)!.displayName).join(', ');
                                        return {
                                            'splittingSets': splittingSetPretty
                                        };
                                    });
                            }
                            let splittingSetsMerged = JSON.parse(event.data.result.organizationAnalysis.minimal_splitting_sets);
                            if (splittingSetsMerged.length > 0) {
                                this.splittingSetsMergedMinLength = splittingSetsMerged[0].length;
                                this.splittingSetsMerged = splittingSetsMerged
                                    .map((splittingSet: string[]) => {
                                        return {
                                            'splittingSets': splittingSet.join(', ')
                                        };
                                    });
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