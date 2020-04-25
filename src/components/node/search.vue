<template>
    <div class="dropdown search">
        <b-form-input class="form-control search-input" type="text" v-model.lazy="searchString"
                      id="searchInput" placeholder="Search"
                      autocomplete="off"
                      @keydown.down.native="onArrowDown"
                      @keydown.up.native="onArrowUp"
                      @keydown.enter.native.prevent.stop="onEnter">
        </b-form-input>
        <div class="dropdown-menu sb-dropdown-menu" v-bind:class="{show: showSuggestions}"
             aria-labelledby="searchInput">
            <a
                    class="dropdown-item"
                    href="#" v-for="(match, i) in filteredList"
                    :key="i"
                    @click.prevent.stop="navigate(match)"
                    :class="{ 'active': i === arrowCounter }">
                <div class="w-100">
                    <h5 class="mb-1 mr-2 name">{{ match.name | truncate(30) }}</h5>
                </div>
                <small>{{match.type}}</small>
            </a>
        </div>

        <div class="input-icon-addon">
            <b-icon-search/>
        </div>
    </div>
</template>

<script lang="ts">

    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';

    import {Network, Node, Organization} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import {RawLocation} from 'vue-router';

    type Match =  { name: string, type: string, route: RawLocation };
    @Component({
        name: 'search'
    })
    export default class Search extends Vue {
        protected searchString: string = '';
        protected arrowCounter: number = -1;

        get store(): Store {
            return this.$root.$data.store;
        }

        get network(): Network {
            return this.store.network;
        }

        get showSuggestions() {
            if (this.searchString === '') {
                return false;
            }

            return this.filteredList.length !== 0;
        }

        get filteredList(): Match[] {
            let match = (text: string) => text.toLowerCase().includes(this.searchString.toLowerCase());

            let matchedOrganizations = this.network.organizations.filter((organization) => {
                return match(organization.name);
            }).map(organization => {
                    return {
                        name: organization.name, type: 'organization', route: {
                            name: 'organization-dashboard',
                            params: {organizationId: organization.id},
                            query: {'center': '1', 'no-scroll': '1', 'view': this.$route.query.view}
                        } as RawLocation
                    };
                }
            );

            let matchedNodes = this.network.nodes.filter((node) => {
                return match(node.displayName) || match(node.publicKey!);
            }).map(node => {
                    return {
                        name: node.displayName, type: node.isValidator ? 'validator node' : 'watcher node', route: {
                            name: 'node-dashboard',
                            params: {publicKey: node.publicKey!},
                            query: {'center': '1', 'no-scroll': '1', 'view': this.$route.query.view}
                        } as RawLocation
                    };
                }
            );

            return matchedOrganizations.concat(matchedNodes).slice(0,10);
        }

        protected navigate(match: Match) {
            this.searchString = '';
            this.$router.push(match.route);
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
                this.navigate(this.filteredList[this.arrowCounter]);
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
        width: 100%;
        z-index: 10000;
        margin-top: 0!important;
    }
    .name {
        white-space: normal;
    }
</style>