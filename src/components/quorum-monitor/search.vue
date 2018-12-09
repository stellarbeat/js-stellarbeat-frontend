<template>
    <div class="dropdown search">
        <b-form-input class="form-control" type="text" v-model="searchString" id="searchInput" placeholder="Search node"
                      autocomplete="off"
                      @keydown.down.native="onArrowDown"
                      @keydown.up.native="onArrowUp"
                      @keydown.enter.native.prevent.stop="onEnter">
        </b-form-input>
        <div class="dropdown-menu dropdown-menu-right" v-bind:class="{show: showSuggestions}"
             aria-labelledby="searchInput">
            <a
                    class="dropdown-item"
                    href="#" v-for="(node, i) in filteredList"
                    :key="i"
                    @click.prevent.stop="nodeSelected(node)"
                    :class="{ 'active': i === arrowCounter }">
                {{ node.displayName | truncate(20)}}
            </a>
        </div>
    </div>
</template>

<script lang="ts">

    import Vue from "vue";
    import {Component, Prop} from "vue-property-decorator";

    import {Node} from "@stellarbeat/js-stellar-domain";

    @Component({
        name: "search"
    })
    export default class QuorumSetDisplay extends Vue {
        @Prop()
        protected nodes!: Node[];

        protected searchString: string = "";
        protected arrowCounter: number = -1;

        get showSuggestions() {
            if (this.searchString === "") {
                return false;
            }

            return this.filteredList.length !== 0;
        }

        get filteredList() {
            return this.nodes.filter((node) => {
                return node.displayName.toLowerCase().includes(this.searchString.toLowerCase());
            });
        }

        protected nodeSelected(node: Node) {
            this.searchString = "";
            this.$router.push({
                name: "quorum-monitor-node",
                params: {publicKey: node.publicKey},
                query: {"center": "1", 'no-scroll': '0'}
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

    .dropdown-menu {
        min-width: 100%;
    }
</style>