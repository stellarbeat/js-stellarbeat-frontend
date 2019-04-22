<template>
    <div class="p-0 toml-config-viewer">
        <div class="toml-title pt-1 pb-3" v-on:click="toggleShow">
            <i class="chevron fe mr-1" v-bind:class="chevron"></i><h5 class="m-0">Quorumset toml  configuration</h5>
        </div>

        <pre v-if="showing"><code>{{tomlConfig}}</code></pre>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node, Network} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "toml-config-viewer",
    })
    export default class TomlConfigViewer extends Vue {
        @Prop()
        public node!: Node;
        @Prop()
        public network!: Network;

        protected showing: boolean = false;

        get chevron():string {
            return this.showing ? 'fe-chevron-down' : 'fe-chevron-right';
        }

        get tomlConfig():string {
            return this.network.getQuorumSetTomlConfig(this.node.quorumSet);
        }

        toggleShow():void{
            this.showing = !this.showing;
        }
    }
</script>

<style scoped>
    .chevron{
        float: left;
    }
    .toml-title{
        cursor:pointer;
        color: #1997c6;
    }
    .toml-title:hover {
        background-color: #f8f9fa;
    }
</style>


