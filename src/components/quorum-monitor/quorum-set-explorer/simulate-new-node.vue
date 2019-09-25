<template>
    <div class="">
        <b-button v-b-modal.simulate-node-modal size="sm" variant="primary">
            <i class="fe fe-plus-circle"></i>
            Simulate a new node
        </b-button>
        <b-modal
                ok-title="Simulate Node" size="lg" id="simulate-node-modal"
                title="Simulate a new node"
                v-on:ok="simulateNewNode"
        >
            <b-form-input v-model="newNodeName"
                          placeholder="Enter a name"></b-form-input>
        </b-modal>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";
    import Store from "@/Store";
    import {Node} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "simulate-new-node"
    })
    export default class SimulateNewNode extends Vue
    {
        protected newNodeName: string = "";

        get store():Store {
            return this.$root.$data.store;
        }

        public simulateNewNode() {
            let node = new Node("localhost");
            node.name = this.newNodeName === "" ? "MyNewNode" : this.newNodeName;
            node.publicKey = this.makePublicKey();
            node.quorumSet.threshold = 1;
            node.active = true;
            node.isValidating = true;
            node.isValidator = true;
            this.$set(node, "x", 0); //doesn't belong here, needs better solution
            this.$set(node, "y", 0);
            this.store.addNodeToNetwork(node);
            this.$router.push(
                {
                    name: "quorum-monitor-node",
                    params: {publicKey: node.publicKey},
                    query: {"center": "1", "no-scroll": "1"},
                },
            );
        }

        protected makePublicKey() {
            let result = "G";
            let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let charactersLength = characters.length;
            for (let i = 0; i < 56; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

    }
</script>
<style scoped>

</style>