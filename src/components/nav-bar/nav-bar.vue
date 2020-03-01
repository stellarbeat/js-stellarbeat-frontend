<template>
    <nav class="navbar navbar-expand-sm navbar-light navbar-primary navbar-vertical" id="navbar-primary">

        <div class="container">
            <a href="#" class="navbar-brand navbar-brand-autodark d-none-navbar-horizontal  pr-5 pt-2">
                <img src="@/assets/logo.png" alt="Tabler" class="navbar-brand-logo navbar-brand-logo-large">
                <img src="@/assets/logo.png" alt="Tabler" class="navbar-brand-logo navbar-brand-logo-small">
                <div class="d-flex flex-column">
                <h2 class="brand-title mb-0 mt-1">Stellarbeat.io</h2>
                <h6 data-v-fa2d42ee="" class="text-muted mt-0 opacity-50">stellar network visibility</h6>
                </div>
            </a>
            <div class="navbar-collapse collapse">
                <transition
                        name="fade"
                        mode="out-in"
                >
                    <div v-if="selectedNode" :key="selectedNode.publicKey">
                        <h1 class="navbar-heading my-navbar-heading">{{selectedNode.displayName | truncate(30)}}</h1>
                        <h1 class="navbar-heading">Quorumset with threshold {{selectedNode.quorumSet.threshold}}  </h1>

                        <nav-container-quorum-set :quorumSet="selectedNode.quorumSet"
                                                  :show="false"></nav-container-quorum-set>
                    </div>
                </transition>

                <h6 class="navbar-heading mt-3">Tools</h6>
                <ul class="navbar-nav">

                    <li class="nav-item">
                        <a class="nav-link my-nav-link" href="#">
                            <span class="nav-link-title">Halting analysis</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link my-nav-link" href="#">
                            <span class="nav-link-title">Simulate a new node</span>
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link my-nav-link" href="#">
                            <span class="nav-link-title">Copy publickey to clipboard</span>
                        </a>
                    </li>

                    <li class="nav-item">
                        <router-link active-class="active" class="nav-link my-nav-link" :to="{ name: 'api'}">
                            <i class="fe fe-share-2"></i>API
                        </router-link>
                    </li>
                </ul>

                <h6 class="navbar-heading mt-3">Options</h6>
                <li class="nav-item my-option">
                    <label class="form-check form-switch ">
                        <input class="form-check-input" type="checkbox">
                        <span class="form-check-label">Include watcher nodes</span>
                    </label>
                </li>

            </div>
        </div>
    </nav>
</template>

<script lang="ts">
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import TransitiveQuorumSetValidatorsCard
        from '@/components/quorum-monitor/cards/transitive-quorum-set-validators-card.vue';
    import Store from '@/store/Store';
    import {Network, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import {AlertTriangleIcon} from 'vue-feather-icons';
    import NavLink from '@/components/nav-bar/nav-link-validator.vue';
    import NavLinkQuorumSet from '@/components/nav-bar/nav-link-quorum-set.vue';
    import NavContainerQuorumSet from '@/components/nav-bar/nav-container-quorum-set.vue';

    @Component({
        name: 'nav-bar',
        components: {
            NavContainerQuorumSet,
            NavLinkQuorumSet, NavLink, TransitiveQuorumSetValidatorsCard, AlertTriangleIcon
        },
    })
    export default class NavBar extends Vue {
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
<style scoped>
    .my-nav-link {
        padding-top: 5px !important;
        padding-bottom: 5px !important;
        height: 22px !important;
    }

    .my-navbar-heading {
        font-size: 26px !important;
        word-wrap: break-word;
    }

    .my-option {
        opacity: 0.6;
        list-style: none;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition-duration: 0.3s;
        transition-property: opacity;
        transition-timing-function: ease;
    }

    .fade-enter,
    .fade-leave-active {
        opacity: 0
    }

</style>