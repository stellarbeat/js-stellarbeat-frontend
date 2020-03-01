<template>
    <nav class="navbar navbar-light navbar-secondary navbar-expand" id="navbar-secondary">
        <div class="container-fluid">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <router-link active-class="active" class="nav-link" :to="{ name: 'home'}" exact>
                        <span class="nav-link-icon"></span>
                        <span class="nav-link-title">Network</span>
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link active-class="active" class="nav-link" :to="{ name: 'nodes'}"><i
                            class="fe fe-list"></i>Nodes
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link active-class="active" class="nav-link" :to="{ name: 'organizations'}"><i
                            class="fe fe-globe"></i>Organizations
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link active-class="active" class="nav-link" :to="{ name: 'faq'}"><i
                            class="fe fe-help-circle"></i>FAQ
                    </router-link>
                </li>
            </ul>
            <form class="form-inline w-50 mr-4 d-none d-md-flex" _lpchecked="1">
                <div class="input-icon w-100">
              <span class="input-icon-addon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><circle
                        cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
                    <input type="text" class="form-control form-control-flush w-100" placeholder="Search…">
                </div>
            </form>
        </div>
    </nav>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import TransitiveQuorumSetValidatorsCard
        from '@/components/quorum-monitor/cards/transitive-quorum-set-validators-card.vue';
    import Store from '@/store/Store';
    import {Network} from '@stellarbeat/js-stellar-domain';

    @Component({
        name: 'nav-bar-top'
    })
    export default class NavBarTop extends Vue {
        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get network(): Network {
            return this.$root.$data.store.network;
        }
    }
</script>