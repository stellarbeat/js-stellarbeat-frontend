<template>
    <div class="p-0 pt-3 toml-config-viewer">
        <div class="toml-title" v-on:click="toggleShow">
            <i class="chevron fe mr-1" v-bind:class="chevron"></i><h5>Toml configuration</h5>
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
            console.log("click");
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
    }
</style>


