<template>
    <li class="list-group-item p-0 pt-3">
        <div @click="toggle" class="quorum-set" v-bind:class="quorumSetState">
            <i class="caret fe mr-1" v-bind:class="caret"></i>
            <h5 class="quorumSetTitle">
                Quorumset with threshold: {{quorumSet.threshold}}
            </h5>
        </div>
        <div v-show="open" class="list-group list-group-flush nested-tree">
            <div v-for="validator in quorumSet.validators" class="list-group-item p-1 validator">
                <a href="#" class="validator-link"
                   v-on:click.prevent.stop="selectNode(validator)">
                    <div v-bind:class="nodeState(validator)">
                        {{validatorDisplayName(validator) | truncate(30)}}
                    </div>
                </a>
                        <NodeActionBar :node="getNode(validator)" :network="network"
                                       v-on:node-toggle-active="toggleNodeActive"
                                       v-on:node-show-modal="showModal"></NodeActionBar>
            </div>
                    <quorum-set-display v-for="innerQuorumSet in quorumSet.innerQuorumSets" :key="innerQuorumSet.hashKey"
                                :network="network"
                                :quorumSet="innerQuorumSet"
                                :root="false"
                                v-on:node-toggle-active="toggleNodeActive"
                                v-on:node-show-modal="showModal">
                    </quorum-set-display>
            </div>
    </li>
</template>

<script lang="ts">
import NodeActionBar from './node-action-bar.vue';

import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

import {Network, Node, QuorumSet} from '@stellarbeat/js-stellar-domain';

@Component({
    name: 'quorum-set-display',
    components: {
        NodeActionBar,
    },
})
export default class QuorumSetDisplay extends Vue {
    @Prop()
    public network!: Network;
    @Prop()
    public quorumSet!: QuorumSet;
    @Prop()
    public root!: boolean;

    public open: boolean = this.root;

    public validatorDisplayName(validator: string) {
        if (this.network.getNodeByPublicKey(validator)) {
            return this.network.getNodeByPublicKey(validator).displayName;
        } else {
            return validator;
        }
    }

    public getNode(publicKey: string) {
        return this.network.getNodeByPublicKey(publicKey);
    }

    public toggle() {
        this.open = !this.open;
    }
    public nodeState(validator: string) {
        const node = this.network.getNodeByPublicKey(validator);
        return {
            inactive: !node.active,
            active: node.active,
            failing: this.network.isNodeFailing(node),
        };
    }

    public toggleNodeActive(node: Node) {
        this.$emit('node-toggle-active', node);
    }

    public showModal(node: Node) {
        this.$emit('node-show-modal', node);
    }

    public selectNode(validator: string) {
        this.$router.push({
            name: 'quorum-monitor-node',
            params: {publicKey: validator},
            query: {'center': '1', 'no-scroll': '1'},
        });
    }

    get caret() {
        return this.open ? 'fe-chevron-down' : 'fe-chevron-right';
    }

    get quorumSetState() {
        const failing = this.network.isQuorumSetFailing(this.quorumSet);
        return {
            failing,
            active: !failing,
        };
    }
}
</script>

<style scoped>
    .quorumSetTitle {
        margin-bottom: 1em;
    }

    .active-node {
        color: #1997c6;
    }

    li {
        padding-left: 0px;
    }

    .caret {
        cursor: pointer;
        float: left;
    }

    .nested-tree {
        margin-left: 20px;
    }

    .inactive {
        color: #c3c2bb
    }

    .active {
        color: #1997c6
    }

    .failing {
        color: red
    }

    .list-group-item, .list-group-item:hover {
        z-index: auto;
    }

    .validator-link {
        width: 100%;
    }

    .validator {
        display: flex;
        justify-content: space-between;
    }
    a:hover, a:visited, a:link, a:active
    {
        text-decoration: none;
    }
    a:hover
    {
        background-color: #f8f9fa;
    }
    .quorum-set
    {
        cursor: pointer;
    }
</style>