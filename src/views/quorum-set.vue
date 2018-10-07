<template>
    <li class="list-group-item">
        <div @click="toggle" v-bind:class="quorumSetState">
            <font-awesome-icon pull="left" class="caret" size="2x" v-bind:icon="caret"/>
            <h6>
                Quorumset with threshold: {{quorumSet.threshold}}
            </h6>
        </div>
        <div v-show="open" class="list-group list-group-flush nested-tree">
            <a href="#" v-for="validator in quorumSet.validators" class="list-group-item list-group-item-action" v-on:click.prevent.stop="selectNode(validator)">
                <div v-bind:class="nodeState(validator)">
                    {{validatorDisplayName(validator) | truncate(30)}}
                    <span class="fa-pull-right">
                    <NodeActionBar :node="getNode(validator)" :network="network" v-on:node-toggle-active="toggleNodeActive" v-on:node-show-modal="showModal"></NodeActionBar>
                </span>
                </div>
            </a>
            <quorum-set v-for="innerQuorumSet in quorumSet.innerQuorumSets"
                        :network="network"
                        :quorumSet="innerQuorumSet"
                        :root="false"
                        v-on:node-toggle-active="toggleNodeActive"
                        v-on:node-show-modal="showModal">
            </quorum-set>
        </div>
    </li>
</template>

<script>
    const NodeActionBar = require('./node/node-action-bar.vue');

    export default {
        name: "quorum-set",
        components: {
            NodeActionBar
        },
        props: {
            "network": {
                type: Object
            },
            "quorumSet": {
                type: Object
            },
            "root": {
                type: Boolean
            }
        },
        data() {
            return {
                open: this.root ? true : false
            }
        },
        methods: {
            validatorDisplayName: function (validator) {
                if (this.network.getNodeByPublicKey(validator)) {
                    return this.network.getNodeByPublicKey(validator).displayName;
                } else {
                    return validator;
                }
            },
            getNode: function(publicKey) {
                  return this.network.getNodeByPublicKey(publicKey);
            },
            toggle: function () {
                this.open = !this.open;
            },
            nodeState: function (validator) {
                let node = this.network.getNodeByPublicKey(validator);
                return {
                    'inactive': !node.active,
                    'active': node.active,
                    'failing': this.network.isNodeFailing(node)
                }
            },
            toggleNodeActive: function(node) {
                this.$emit("node-toggle-active", node);
            },
            showModal: function(node) {
                this.$emit("node-show-modal", node);
            },
            selectNode: function (validator) {
                this.$emit("node-selected", this.network.getNodeByPublicKey(validator));
                this.$router.push({ name: 'node', params: { publicKey: this.network.getNodeByPublicKey(validator).publicKey }});
            }
        },
        computed: {
            caret: function () {
                return this.open ? 'caret-down' : 'caret-right';
            },
            quorumSetState: function () {
                let failing = this.network.isQuorumSetFailing(this.quorumSet);
                return {
                    'failing': failing,
                    'active': !failing
                }
            }
        }
    }
</script>

<style scoped>
    .active-node {
        color: #1997c6;
    }

    li {
        padding-left: 0px;
    }

    .caret {
        height: 0.6em;
        cursor: pointer;
    }

    .nested-tree {
        margin-left: 20px;
    }

    .inactive {
        color: #ECEBE4
    }

    .active {
        color: #1997c6
    }

    .failing {
        color: red
    }
    .list-group-item, .list-group-item:hover{ z-index: auto; }
</style>