<template>
    <div class="action-bar ">
        <b-dropdown right id="more" size="sm" text="More" class="p-0 m-0 more-button" no-caret>
            <template slot="button-content">
                <i class="fe fe-more-vertical"></i>
            </template>
            <b-dropdown-item v-on:click="$emit('node-show-modal', node)">
                <i class="dropdown-icon fe fe-info"></i>
                Info
            </b-dropdown-item>
            <b-dropdown-item v-on:click="$emit('node-toggle-active', node)">
                <i class="dropdown-icon fe fe-power"></i>
                {{node.active ? 'Disable' : 'Enable'}}
            </b-dropdown-item>
            <b-dropdown-item v-on:click="$emit('node-delete', node)">
                <i class="dropdown-icon fe fe-minus-circle"></i>
                Delete
            </b-dropdown-item>
        </b-dropdown>
        <!--div class="btn-group btn-group-sm" role="group" aria-label="actions">
            <button type="button" class="btn btn-sm btn-icon btn-secondary node-info-btn" title="show info"
                    v-on:click.prevent.stop="$emit('node-show-modal', node)">
                <i class="fe fe-info"></i>
            </button>
            <button type="button" class="btn btn-sm btn-icon" title="(de-)activate node"
                    v-on:click.prevent.stop="$emit('node-toggle-active', node)"
                    v-bind:class="[node.active ? 'btn-primary' : 'btn-secondary']">
                <i class="fe fe-power"></i>
            </button>
        </div!-->
    </div>

</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "node-action-bar",
    })
    export default class NodeActionBar extends Vue {
        @Prop()
        public node!: Node;
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
</style>

<style>
    .dropdown-toggle {
        border: none !important;
    }
</style>


