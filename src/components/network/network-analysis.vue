<template>
    <div class="">
        <b-modal lazy ok-title="Close" ok-variant="light"
                 ok-only size="xl" id="network-analysis-modal"
                 title="Network analysis (beta)"
        >
            <div v-bind:class="dimmerClass">
                <div class="loader mt-2"></div>
                <div class="dimmer-content">
                    <div v-if="hasResult">
                        <dl class="mb-0">
                            <dt>Quorum Intersection</dt>
                            <dd> {{hasQuorumIntersection ? 'Yes' : 'No'}}
                            </dd>
                            <div v-if="hasQuorumIntersection">
                                <dt>Liveness risk analysis</dt>
                                <dd> Found set(s) of {{this.blockingSetExample.length}} nodes across
                                    {{this.blockingSetOrgsExample.length}} organizations that could impact liveness. <br/> For example
                                    nodes
                                    [ {{this.blockingSetExample.join(', ')}} ] across organizations [
                                    {{this.blockingSetOrgsExample.join(', ')}} ]
                                </dd>

                                <dt>Safety risk analysis</dt>
                                <dd> Found set(s) of {{this.splittingSetExample.length}} nodes across
                                    {{this.splittingSetOrgsExample.length}} organizations fthat could impact safety. <br/> For example
                                    nodes
                                    [ {{this.splittingSetExample.join(', ')}} ] across organizations [
                                    {{this.splittingSetOrgsExample.join(', ')}} ]
                                </dd>
                            </div>
                        </dl>
                        <b-table id="network-analysis-table" striped hover :fields="fields" :items="minimalQuorums" :per-page="perPage" thead-class="my-thead"
                                 tbody-class="my-tbody" :current-page="currentPage">
                            <template v-slot:head(minimalQuorums)="data">
                                <span class="dl-header">{{data.label}}</span>
                            </template>
                        </b-table>
                        <b-pagination
                                v-model="currentPage"
                                :total-rows="rows"
                                :per-page="perPage"
                                aria-controls="network-analysis-table"
                        ></b-pagination>
                    </div>
                </div>
            </div>
            <b-button v-if="!hasResult" variant="primary" v-on:click="performAnalysis">Perform analysis</b-button>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import {Component, Mixins} from 'vue-property-decorator';
    import {BFormInput, BModal, BButton, BFormCheckbox, BFormSelect, BTable, BPagination} from 'bootstrap-vue';
    import {StoreMixin} from '@/mixins/StoreMixin';
    import FbasAnalysisWorker
        from 'worker-loader?name=dist/[name].js!./../../workers/fbas-analysis-v1.worker.ts';
    import {IsLoadingMixin} from '@/mixins/IsLoadingMixin';
    import {Node, PublicKey} from '@stellarbeat/js-stellar-domain';

    const _FbasAnalysisWorker: any = FbasAnalysisWorker; // workaround for typescript not compiling web workers.

    @Component({
        components: {BFormInput, BModal, BButton, BFormCheckbox, BFormSelect, BTable, BPagination}
    })
    export default class NetworkAnalysis extends Mixins(StoreMixin, IsLoadingMixin) {
        protected fbasAnalysisWorker = new _FbasAnalysisWorker();
        protected merge: boolean = false;
        protected hasResult: boolean = false;
        protected hasQuorumIntersection: boolean = false;
        protected blockingSetExample: string[] = [];
        protected blockingSetOrgsExample: string[] = [];
        protected splittingSetExample: string[] = [];
        protected splittingSetOrgsExample: string[] = [];
        protected minimalQuorums: { value: PublicKey[], text: string }[] = [];
        protected fields: any = [
            // A column that needs custom formatting
            {key: 'minimalQuorums', label: 'Minimal quorums'}
        ];
        protected perPage: number = 10;
        protected currentPage: number = 1;

        get rows() {
            console.log(this.minimalQuorums.length);
            return this.minimalQuorums.length
        }
        performAnalysis() {
            this.isLoading = true;
            this.fbasAnalysisWorker.postMessage({
                nodes: this.network.nodes,
                organizations: this.network.organizations
            });
        }

        async mounted() {
            //console.log(fbas_analysis(JSON.stringify(this.network.nodes), JSON.stringify(this.network.organizations), false));
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
                            console.log(event.data.result);
                            this.hasResult = true;
                            this.hasQuorumIntersection = event.data.result.nodesAnalysis.has_intersection;
                            //todo: we filter out the quorums with non validating nodes, until the library supports this natively
                            this.minimalQuorums = JSON.parse(event.data.result.nodesAnalysis.minimal_quorums)
                                .filter((quorum: PublicKey[]) => quorum.every(
                                    (publicKey: PublicKey) => !this.network.isNodeFailing(this.network.getNodeByPublicKey(publicKey)!)
                                )).map((quorum: PublicKey[]) => {
                                    let quorumPretty = quorum.map(publicKey => this.network.getNodeByPublicKey(publicKey)!.displayName).join(', ');
                                    return {
                                        'minimalQuorums': quorumPretty
                                    };
                                });
                            const minimalBlockingSets = JSON.parse(event.data.result.nodesAnalysis.minimal_blocking_sets);
                            //const minimalBlockingSetsByOrganization = JSON.parse(event.data.result.organizationAnalysis.minimal_blocking_sets);

                            //we filter out the non validating nodes, until the library supports this natively
                            if (minimalBlockingSets.length > 0) {
                                this.blockingSetExample = minimalBlockingSets[0]
                                    .map((publicKey: string) => this.network.getNodeByPublicKey(publicKey))
                                    .filter((node: Node) => node.isValidating)
                                    .map((node: Node) => node.displayName);
                                this.blockingSetOrgsExample = minimalBlockingSets[0]
                                    .map((publicKey: string) => this.network.getNodeByPublicKey(publicKey))
                                    .filter((node: Node) => node.isValidating)
                                    .map((node: Node) => {
                                        if (node.organizationId)
                                            return this.network.getOrganizationById(node.organizationId)!.name;
                                        else return node.publicKey;
                                    })
                                    .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index);
                            }
                            const minimalSplittingSets = JSON.parse(event.data.result.nodesAnalysis.minimal_splitting_sets);
                            const minimalSplittingSetsByOrganization = JSON.parse(event.data.result.organizationAnalysis.minimal_splitting_sets);
                            if (minimalSplittingSets.length > 0) {
                                this.splittingSetExample = minimalSplittingSets[0].map((publicKey: string) => {
                                    let node = this.network.getNodeByPublicKey(publicKey);
                                    if (node)
                                        return node.displayName;
                                    else return publicKey;
                                });
                                this.splittingSetOrgsExample = minimalSplittingSetsByOrganization[0];
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
        padding-left: 0rem !important;
        padding-right: 0rem !important;
        color: #495057;
        text-transform: none;
        font-size: 0.9375rem;
        font-weight: 700;
    }

    .my-tbody tr td {
        padding-left: 0rem !important;
        padding-right: 0rem !important;
    }
</style>