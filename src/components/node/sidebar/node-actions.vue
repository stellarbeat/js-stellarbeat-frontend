<template>
        <b-dropdown right size="sm" text="More" class="p-0 m-0" toggle-class="more-button btn-thin" no-caret>
            <template slot="button-content">
                <b-icon-three-dots-vertical scale="0.9"/>
            </template>
            <b-dropdown-header id="dropdown-header-label">
                Simulation options
            </b-dropdown-header>
            <b-dropdown-item v-on:click.prevent.stop="store.toggleValidating(node)">
                <b-icon-lightning scale="0.9"/>
                {{node.isValidating ? 'Stop validating' : 'Try validating'}}
            </b-dropdown-item>
            <b-dropdown-item v-if="supportsDelete" v-on:click="$emit('node-delete', node)" @click.prevent.stop>
                <b-icon-x-circle scale="0.9"/>
                Remove
            </b-dropdown-item>
            <b-dropdown-header id="dropdown-header-label">
                Tools
            </b-dropdown-header>
            <b-dropdown-item v-on:click.prevent.stop="store.showHaltingAnalysis(node)">
                <b-icon-gear-wide scale="0.9"/>
                Halting analysis
            </b-dropdown-item>
            <b-dropdown-item-button v-on:click.prevent.stop="copyPublicKey">
                <b-icon-clipboard scale="0.9"/>
                Copy public key
            </b-dropdown-item-button>
        </b-dropdown>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node} from "@stellarbeat/js-stellar-domain";
    import Store from '@/store/Store';

    @Component({
    })
    export default class NodeActions extends Vue {
        @Prop()
        public node!: Node;
        @Prop({default: false})
        public supportsDelete!: Boolean;

        get store():Store {
            return this.$root.$data.store;
        }

        copyPublicKey() {
            this.$copyText(this.node.publicKey!);
        }
    }
</script>

<style scoped>

    .btn-group-xs > .btn, .btn-xs {
        padding: .25rem .25rem;
        font-size: .875rem;
        line-height: .5;
        border-radius: .2rem;
    }

    .btn-primary {
        background: #1997c6;
        border-color: #1997c6;
    }

    .btn-primary:hover {
        color: #fff;
        background-color: #1a85ad;
        border-color: #1a85ad;
    }
    .dropdown-header {
        padding: 0.5rem 1rem;
    }
    .hover-btn {
        position: absolute;
        right: 45px;
        border: none;
        outline: 0;
    }
</style>
