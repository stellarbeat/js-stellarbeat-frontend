<template>
    <div v-if="isLoading" class="row mt-9">
        <div class="col-5"></div>
        <div class="col-2 loader"></div>
        <div class="col-5"></div>

    </div>
    <div v-else>
        <QuorumSetConnections :network="network"></QuorumSetConnections>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import QuorumSetConnections from './../../components/home/quorum-set-connections/quorum-set-connections.vue';
    import {Network} from '@stellarbeat/js-stellar-domain';

    @Component({
        name: "quorum-set-connections-graph",
        components: { QuorumSetConnections },
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