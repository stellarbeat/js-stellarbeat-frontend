<template>
    <div class="p-0">
        <pre ><code>{{tomlConfig}}</code></pre>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {QuorumSet, Network} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "toml-config-viewer",
    })
    export default class TomlConfigViewer extends Vue {
        @Prop()
        public quorumSet!: QuorumSet;
        @Prop()
        public network!: Network;

        get tomlConfig():string {
            return this.network.getQuorumSetTomlConfig(this.quorumSet);
        }
    }
</script>

<style scoped>
</style>


