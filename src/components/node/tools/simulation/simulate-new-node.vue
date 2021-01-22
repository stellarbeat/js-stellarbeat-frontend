<template>
    <div class="">
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
    import Store from "@/store/Store";
    import {Node} from "@stellarbeat/js-stellar-domain";

    import {BFormInput, BModal} from 'bootstrap-vue';

    @Component({
        components: {BFormInput, BModal}
    })
    export default class SimulateNewNode extends Vue
    {
        protected newNodeName: string = "";

        get store():Store {
            return this.$root.$data.store;
        }

        public simulateNewNode() {
            let node = new Node(this.makePublicKey());
            node.name = this.newNodeName === "" ? "MyNewNode" : this.newNodeName;
            node.quorumSet.threshold = 1;
            node.active = true;
            node.isValidating = true;
            this.$set(node, "x", 0); //doesn't belong here, needs better solution
            this.$set(node, "y", 0);
            this.store.addNodeToNetwork(node);
            this.$router.push(
                {
                    name: "node-dashboard",
                    params: {publicKey: node.publicKey},
                    query: {"center": "1", "no-scroll": "1", 'view': this.$route.query.view, 'network': this.$route.query.network, 'at': this.$route.query.at},
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