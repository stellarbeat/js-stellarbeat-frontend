<template>
        <div v-if="isLoading" class="row pt-9 embed">
            <div class="col-5"></div>
            <div class="col-2 loader"></div>
            <div class="col-5"></div>
        </div>
        <div v-else>
            <QuorumSetConnections class="parenty" :network="network"></QuorumSetConnections>
        </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import QuorumSetConnections from "./../../components/home/quorum-set-connections/quorum-set-connections.vue";
    import {Network} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "quorum-set-connections-graph",
        components: {QuorumSetConnections},
        metaInfo: {
            title: "Quorum set connections graph  - Stellarbeat.io",
            meta: [
                {name: "description", content: "Embeddable quorumset connections graph"},
            ],
        },
    })
    export default class QuorumSetConnectionsGraph extends Vue {
        @Prop()
        protected network!: Network;
        @Prop()
        protected isLoading!: boolean;
    }
</script>
<style scoped>
    .parenty >>> .quorum-set-link {
        stroke: #7d24fa !important;
    }

    .parenty >>> .link-source {
        stroke: #fda534;
    }

    .parenty >>> .link-target {
        stroke: #17a84c;
    }

    .parenty >>> .quorum-set-node {
        fill: #000000;
        opacity: 0.25;
        cursor: pointer;
    }

    .parenty >>> .quorum-set-node:hover {
        fill: #7d24fa;
        opacity: 1;
    }

    .parenty >>> .source {
        fill: #17a84c;
        opacity: 1;
    }

    .parenty >>> .target {
        fill: #fda534;
        opacity: 1;
    }
</style>