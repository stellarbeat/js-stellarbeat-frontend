<template>
    <div class="list-group list-group-flush nested-tree">
        <div class="list-group-item p-1 pr-0 node-list"
             v-for="node in nodes">
                <a href="#" class="node-link"
                   v-on:click.prevent.stop="selectNode(node)">
                    <div v-bind:class="nodeState(node)">
                        {{node.displayName | truncate(30)}}
                    </div>
                </a>
                <NodeActionBar :node="node" :network="network"
                               v-on:node-toggle-active="toggleActive(node)"></NodeActionBar>
        </div>
    </div>
</template>

<script lang="ts">
import NodeActionBar from './node-action-bar.vue';

import Vue from 'vue';
import {Component, Prop} from 'vue-property-decorator';

import {Network, Node} from '@stellarbeat/js-stellar-domain';

@Component({
    name: 'node-list',
    components: {
        NodeActionBar,
    },
})
export default class NodeList extends Vue {
    @Prop()
    public nodes!: Node[];
    @Prop()
    public network!: Network;

    public toggleActive(node: Node) {
        this.$emit('node-toggle-active', node);
    }

    public selectNode(node: Node) {
        this.$router.push({
            name: 'quorum-monitor-node',
            params: {publicKey: node.publicKey},
            query: {'center': '1', 'no-scroll': '1'},
        });
    }

    public nodeState(node: Node) {
        return {
            inactive: !node.active,
            active: node.active,
            failing: this.network.isNodeFailing(node),
        };
    }
}
</script>

<style scoped>
    .node-list {
        display: flex;
        justify-content: space-between;
    }
    .node-link {
        width: 100%;
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
    a:hover, a:visited, a:link, a:active {
        text-decoration: none;
    }

    a:hover {
        background-color: #f8f9fa;
    }
</style>


