<template>
    <b-card>
        <template v-slot:header>
            <h3 class="card-title">Halting analysis for {{vertex.label}}</h3>
            <div class="card-options">
                <a href="#" v-on:click.prevent.stop="store.isHaltingAnalysisVisible = false" class="card-options-remove" data-toggle="card-remove"><i class="fe fe-x"></i></a>
            </div>
        </template>
        <div class="row">
            <div class="col-12">
                <b-alert :show="!vertex.isValidating" variant="warning">{{vertex.label}} is failing.</b-alert>
                <div v-if="vertex.isValidating">
                    <b-form inline>
                        <b-form-group
                                label-size="sm"
                                label="Select number of node failures: "
                                label-for="nr-node-failures"
                                label-class="mr-1"
                                @submit.stop.prevent>
                            <b-form-input
                                    id="nr-node-failures"
                                    :state="numberOfNodeFailuresInputState"
                                    class="nr-node-failures-input ml-0"
                                    size="sm"
                                    v-model="numberOfNodeFailures"
                                    type="number"
                                    min="2"
                                    max="9"
                            >
                            </b-form-input>
                        </b-form-group>
                    </b-form>

                        <b-button size="sm" variant="primary" @click="restartHaltingAnalysis" class="mt-1">Detect failures</b-button>
                    <b-alert dismissible :show="numberOfNodeFailures > 4" variant="warning" class="mt-3">Analyzing combinations of {{numberOfNodeFailures}} nodes could take some time. If possible try with a lower number first.</b-alert>
                </div>

                <div v-bind:class="dimmerClass">
                    <div class="loader"></div>
                    <div class="dimmer-content">
                        <div v-if="showAnalysisResult">
                            <h3 v-if="nodeFailures.length === 0" class="mt-3">
                                Great! No combination of {{numberOfNodeFailures}} validators can bring down {{vertex.label}}
                            </h3>
                            <div v-else class="mt-3">
                                <h3>
                                    Found {{nodeFailures.length}} combinations of validators that can halt {{vertex.label}}
                                </h3>
                                <b-form>
                                    <b-form-select :disabled="simulated" :select-size="4" v-model="selectedFailure"
                                                   :options="nodeFailures"></b-form-select>
                                    <b-button v-if="!simulated" size="sm" variant="primary" @click="simulateFailure" class="mt-2">Simulate failure
                                    </b-button>
                                    <b-button v-else size="sm" variant="secondary" @click="resetFailureSimulation" class="mt-2">Reactivate nodes
                                    </b-button>
                                </b-form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </b-card>
</template>

<script lang="ts">

    import Vue from "vue";
    import {Component, Prop, Watch} from "vue-property-decorator";
    import {
        NetworkGraphNode,
        QuorumSet as NetworkQuorumSet
    } from "@stellar/halting-analysis/src";
    import {GraphQuorumSet, Network, PublicKey, Vertex} from "@stellarbeat/js-stellar-domain";
    import HaltingAnalysisWorker from "worker-loader?name=dist/[name].js!./../../../workers/halting-analysisv1.worker.ts";
    import Store from '@/store/Store';

    const _HaltingAnalysisWorker: any = HaltingAnalysisWorker; // workaround for typescript not compiling web workers.

    @Component({
        name: "halting-analysis"
    })
    export default class HaltingAnalysis extends Vue {
        @Prop()
        protected network!: Network;
        @Prop()
        protected publicKey!: PublicKey;

        protected showAnalysisResult: boolean = false;
        protected numberOfNodeFailures: number = 2;
        protected numberOfNodeFailuresInputState: boolean | null = null;
        protected nodeFailures: { value: string[], text: string }[] = [];
        protected selectedFailure: PublicKey[] | null = null;
        protected isLoading: boolean = false;
        protected simulated: boolean = false;

        protected haltingAnalysisWorker = new _HaltingAnalysisWorker();

        get store():Store {
            return this.$root.$data.store;
        }

        get dimmerClass() {
            return {
                dimmer: true,
                active: this.isLoading,
            };
        }

        @Watch("publicKey")
        public onPublicKeyChanged() {
           this.nodeFailures = [];
           this.selectedFailure = null;
           this.simulated = false;
           this.showAnalysisResult = false;
        }

        get vertex() {
            return this.network.graph.getVertex(this.publicKey);
        }

        getNetworkGraphNodes() {
            return Array.from(this.network.graph.vertices.values()) //todo only nodes in transitive quorum set
                .map(vertex => this.mapVertexToNetworkGraphNode(vertex, vertex === this.vertex));
        }

        simulateFailure() {
            if(this.selectedFailure === null) {
                return;
            }
            this.simulated = true;
            this.$emit('update-validating-states', this.selectedFailure.map(publicKey => {
                return {'publicKey': publicKey, 'validating': false}
            }));
            //this.$scrollTo('#quorum-set-explorer-card');
        }

        resetFailureSimulation() {
            if(this.selectedFailure === null) {
                return;
            }
            this.$emit('update-validating-states', this.selectedFailure.map(publicKey => {
                return {'publicKey': publicKey, 'validating': true}
            }));
            this.simulated = false;
        }
        restartHaltingAnalysis() {
            this.isLoading = true;
            this.simulated = false;
            this.haltingAnalysisWorker.postMessage({
                networkGraphNodes: this.getNetworkGraphNodes(),
                numberOfNodeFailures: this.numberOfNodeFailures
            });
        }

        mapVertexToNetworkGraphNode(vertex: Vertex, isRoot: boolean) {
            return {
                "distance": isRoot ? 0 : 1,
                "node": vertex.publicKey,
                "status": vertex.isValidating ? "tracking" : "missing",
                "qset": vertex.isValidating ? this.mapGraphQuorumSetToNetworkQuorumSet(vertex.graphQuorumSet) : undefined
            } as NetworkGraphNode;
        }

        mapGraphQuorumSetToNetworkQuorumSet(graphQuorumSet: GraphQuorumSet): NetworkQuorumSet {
            let innerQSets =
                graphQuorumSet.innerGraphQuorumSets.map(innerQSet => this.mapGraphQuorumSetToNetworkQuorumSet(innerQSet));
            let v = [];
            v.push(...graphQuorumSet.validators);
            innerQSets.forEach(innerQSet => v.push(innerQSet));
            return {
                "t": graphQuorumSet.threshold,
                "v": v
            };
        }

        mounted() {
            this.haltingAnalysisWorker.onmessage = (
                event: { data: { type: string, failures: any } }
            ) => {
                switch (event.data.type) {
                    case "tick": {

                    }
                        break;
                    case "end": {
                        this.nodeFailures = event.data.failures.map((failure: Array<PublicKey>) => {
                            return {
                                value: failure,
                                text: failure.map(publicKey =>
                                    this.network.getNodeByPublicKey(publicKey)!.name ?
                                        this.network.getNodeByPublicKey(publicKey)!.displayName :
                                        publicKey.substr(0, 5)
                                ).join(", ")
                            };
                        });
                        if (this.nodeFailures.length > 0) {
                            this.selectedFailure = this.nodeFailures[0].value;
                        }
                        this.showAnalysisResult = true;
                        this.isLoading = false;
                    }
                        break;
                }
            };
        }
    }
</script>

<style scoped>
    .my-card-title {
        font-size: 1.125rem;
        line-height: 1.2;
        font-weight: 400;
    }

    .nr-node-failures-input {
        margin-left: 5px;
        margin-right: 5px;
        width: 45px !important;
    }
</style>