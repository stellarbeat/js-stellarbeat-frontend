<template>
    <div class="pt-0">
        <div class="pt-2 pb-3 nodes-title active" v-on:click="toggleShow">
            <i class="chevron fe mr-1" v-bind:class="chevron"></i>
            <h5 class="mb-0">Statistics
            </h5>
        </div>
        <div v-if="showing" class="list-group list-group-flush nested-tree">
            <div class="list-group-item p-1 pr-0 node-list">
                <b-progress height="1rem">
                    <b-progress-bar :value="node.statistics.active24HoursPercentage"
                                    v-bind:variant="node.statistics.active24HoursPercentage === 100 ? 'success ' : 'warning'">
                        24H active: {{node.statistics.active24HoursPercentage}}%
                    </b-progress-bar>
                </b-progress>
            </div>
            <div class="list-group-item p-1 pr-0 node-list">
                <b-progress height="1rem">
                    <b-progress-bar :value="node.statistics.active7DaysPercentage"
                                    v-bind:variant="node.statistics.active7DaysPercentage === 100 ? 'success ' : 'warning'">
                        7D active: {{node.statistics.active7DaysPercentage}}%
                    </b-progress-bar>
                </b-progress>
            </div>
            <div class="list-group-item p-1 pr-0 node-list">
                <b-progress height="1rem">
                    <b-progress-bar :value="node.statistics.validating24HoursPercentage"
                                    v-bind:variant="node.statistics.validating24HoursPercentage === 100 ? 'success ' : 'warning'">
                        24H validating: {{node.statistics.validating24HoursPercentage}}%
                    </b-progress-bar>
                </b-progress>
            </div>
            <div class="list-group-item p-1 pr-0 node-list">
                <b-progress height="1rem">
                    <b-progress-bar :value="node.statistics.validating7DaysPercentage"
                                    v-bind:variant="node.statistics.validating7DaysPercentage === 100 ? 'success ' : 'warning'">
                        7D validating: {{node.statistics.validating7DaysPercentage}}%
                    </b-progress-bar>
                </b-progress>
            </div>
            <div class="list-group-item p-1 pr-0 node-list">
                <b-progress height="1rem">
                    <b-progress-bar :value="node.statistics.overLoaded24HoursPercentage"
                                    v-bind:variant="node.statistics.overLoaded24HoursPercentage === 100 ? 'danger ' : 'warning'">
                        24H overloaded: {{node.statistics.overLoaded24HoursPercentage}}%
                    </b-progress-bar>
                </b-progress>
            </div>
            <div class="list-group-item p-1 pr-0 node-list">
                <b-progress height="1rem">
                    <b-progress-bar :value="node.statistics.overLoaded7DaysPercentage"
                                    v-bind:variant="node.statistics.overLoaded7DaysPercentage === 100 ? 'danger ' : 'warning'">
                        7D overloaded: {{node.statistics.overLoaded7DaysPercentage}}%
                    </b-progress-bar>
                </b-progress>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Network, Node} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "node-statistics",
        components: {},
    })
    export default class NodeStatistics extends Vue {
        @Prop()
        public node!: Node[];
        @Prop()
        public network!: Network;

        protected showing: boolean = false;

        get chevron(): string { //todo should be moved to higher up component & code reuse
            return this.showing ? "fe-chevron-down" : "fe-chevron-right";
        }

        toggleShow(): void {
            this.showing = !this.showing;
        }
    }
</script>

<style scoped>
    .node-list {
        width: 100%
    }

    .active {
        color: #1997c6
    }

    a:hover, a:visited, a:link, a:active {
        text-decoration: none;
    }

    a:hover {
        background-color: #f8f9fa;
    }

    .chevron {
        float: left;
    }

    .nodes-title {
        cursor: pointer;
    }

    .nodes-title:hover {
        background-color: #f8f9fa;
    }

</style>


