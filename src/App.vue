<template>
    <div id="app" class="page antialiased" :class="backgroundClass">
        <div class="page">
            <nav-bar></nav-bar>
            <nav-bar-top></nav-bar-top>
            <div class="content">
                <div class="container-fluid">
                    <div class="ml-5">
                        <b-alert :show="showError" variant="danger">{{errorMessage}}</b-alert>
                        <div v-if="store.isLoading && !isFullPreRenderRoute" class="row">
                            <div class="col-5"></div>
                            <div class="col-2 loader"></div>
                            <div class="col-5"></div>

                        </div>
                        <router-view v-if="!store.isLoading || isFullPreRenderRoute"
                                     :network="network"
                                     :isLoading="store.isLoading"
                        >
                        </router-view>
                    </div>
                </div>
            </div>


            <footer class="footer">
                <div class="pl-4 pr-6 container">
                    <div class="row align-items-center flex-row-reverse">
                        <div class="col-auto ml-lg-auto">
                            <div class="row align-items-center">
                                <div class="col-auto">
                                    <ul class="list-inline list-inline-dots mb-0">
                                        <li class="list-inline-item">
                                            <router-link active-class="active" class="nav-link"
                                                         :to="{ name: 'terms-and-conditions'}" exact> Terms and
                                                Conditions
                                            </router-link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component} from 'vue-property-decorator';
    import NavBar from '@/components/nav-bar/nav-bar.vue';
    import NavBarTop from '@/components/nav-bar/nav-bar-top.vue';

    @Component({
        name: 'app',
        components: {NavBarTop, NavBar},
        metaInfo: {
            title: 'Stellarbeat.io - Stellar network visibility',
            meta: [
                {
                    name: 'description',
                    content: 'Giving insight into the Stellar public network through various tools & visualizations.'
                }
            ]
        }
    })

    export default class App extends Vue {
        protected errorMessage = 'Could not connect to stellarbeat.io api';
showIt:boolean=false;
        async created() {
            await this.store.fetchData();
            this.store.isLoading = false;
        }

        get store() {
            return this.$root.$data.store;
        }

        get network() {
            return this.store.network;
        }

        get showError() {
            return this.store.fetchingNodeDataFailed;
        }

        get backgroundClass() {
            return {
                'headless': this.isHeadlessRoute,
                'full': !this.isHeadlessRoute
            };
        }

        get isFullPreRenderRoute() {
            return this.$router.currentRoute.meta.fullPreRender;
        }

        get isHeadlessRoute() {
            return this.$router.currentRoute.meta.isHeadlessRoute;
        }
    }
</script>

<style scoped>


</style>