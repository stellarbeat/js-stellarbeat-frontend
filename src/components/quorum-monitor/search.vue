<template>
    <div class="dropdown search">
        <b-form-input class="form-control" type="text" v-model="searchString" id="searchInput" placeholder="Search node"
                      autocomplete="off"
                      @keydown.down="onArrowDown"
                      @keydown.up="onArrowUp"
                      @keydown.enter.prevent.stop="onEnter"></b-form-input>
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

<script>
    export default {
        name: "search",
        data() {
            return {
                searchString: '',
                arrowCounter: -1
            }
        },
        props: {
            nodes: {
                type: Array,
                required: true
            }
        },
        computed: {
            showSuggestions() {
                if (this.searchString === '')
                    return false;

                if (this.filteredList.length === 0) {
                    return false;
                }

                return true;
            },
            filteredList() {
                return this.nodes.filter(node => {
                    return node.displayName.toLowerCase().includes(this.searchString.toLowerCase())
                })
            },
        },
        methods: {
            nodeSelected: function (node) {
                this.searchString = '';
                this.$router.push({
                    name: 'quorum-monitor-node',
                    params: {publicKey: node.publicKey},
                    query: {center: true, "no-scroll": true}
                });
            },
            onArrowDown() {
                if (this.arrowCounter < this.filteredList.length - 1) {
                    this.arrowCounter = this.arrowCounter + 1;
                }
            },
            onArrowUp() {
                if (this.arrowCounter > 0) {
                    this.arrowCounter = this.arrowCounter - 1;
                }
            },
            onEnter() {
                if (this.arrowCounter !== -1) {
                    this.nodeSelected(this.filteredList[this.arrowCounter]);
                }

                this.arrowCounter = -1;
            }
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