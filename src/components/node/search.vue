<template>
    <div class="dropdown search">
        <b-form-input class="form-control border-0 search-input" type="text" v-model.lazy="searchString" id="searchInput" placeholder="Search validators"
                      autocomplete="off"
                      @keydown.down.native="onArrowDown"
                      @keydown.up.native="onArrowUp"
                      @keydown.enter.native.prevent.stop="onEnter">
        </b-form-input>
        <div class="dropdown-menu" v-bind:class="{show: showSuggestions}"
             aria-labelledby="searchInput">
            <a
                    class="dropdown-item"
                    href="#" v-for="(node, i) in filteredList"
                    :key="i"
                    @click.prevent.stop="nodeSelected(node)"
                    :class="{ 'active': i === arrowCounter }">
                <div class="d-flex w-100 justify-content-between">
                    <h5  v-if="node.name !== undefined" class="mb-1 mr-2">{{ node.name }}</h5>
                    <h5 v-else> {{node.publicKey | truncate(20)}}</h5>
                </div>
                <small v-if="node.name !== undefined">{{node.publicKey | truncate(20)}}</small>            </a>
        </div>
    </div>
</template>

<script lang="ts">

    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node} from "@stellarbeat/js-stellar-domain";
    import Store from "@/store/Store";

    @Component({
        name: "search"
    })
    export default class Search extends Vue {
        protected nodes: Node[] = this.store.network.nodes.filter(
            node => node.isValidator
        );

        protected searchString: string = "";
        protected arrowCounter: number = -1;

        get store():Store {
            return this.$root.$data.store;
        }

        get showSuggestions() {
            if (this.searchString === "") {
                return false;
            }

            return this.filteredList.length !== 0;
        }

        get filteredList() {
            return this.nodes.filter((node) => {
                return node.displayName.toLowerCase().includes(this.searchString.toLowerCase()) ||
                    node.publicKey!.toLowerCase().includes(this.searchString.toLowerCase());
            });
        }

        protected nodeSelected(node: Node) {
            this.searchString = "";
            this.$router.push({
                name: "node-dashboard",
                params: {publicKey: node.publicKey!},
                query: {"center": "1", 'no-scroll': '1'}
            });
        }

        protected onArrowDown() {
            if (this.arrowCounter < this.filteredList.length - 1) {
                this.arrowCounter = this.arrowCounter + 1;
            }
        }

        protected onArrowUp() {
            if (this.arrowCounter > 0) {
                this.arrowCounter = this.arrowCounter - 1;
            }
        }

        protected onEnter() {
            if (this.arrowCounter !== -1) {
                this.nodeSelected(this.filteredList[this.arrowCounter]);
            }

            this.arrowCounter = -1;
        }
    }
</script>

<style scoped>
    .search {
        width: 100%;
    }

    .search-input {
        font-size: 20px;
    }

    .dropdown-menu {
        min-width: 100%;
        z-index: 10000;
    }
</style>