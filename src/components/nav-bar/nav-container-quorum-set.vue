<template>
    <div>
        <div v-on:click="showChildren = !showChildren">
            <nav-link-quorum-set v-if="!isRoot" :quorumSet="quorumSet"></nav-link-quorum-set>
        </div>
        <ul v-bind:class="classObject">
            <li v-for="validator in quorumSet.validators" class="nav-item" :class="validatorClassObject">
                <nav-link-validator :node="network.getNodeByPublicKey(validator)"/>
            </li>
            <li v-for="innerQuorumSet in quorumSet.innerQuorumSets" class="nav-item">
                <nav-container-quorum-set :quorumSet="innerQuorumSet" :level="level+1"></nav-container-quorum-set>
            </li>
        </ul>
    </div>
</template>
<script lang="ts">
    import {Network, Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {AlertTriangleIcon} from 'vue-feather-icons';
    import NavLinkQuorumSet from '@/components/nav-bar/nav-link-quorum-set.vue';
    import NavLinkValidator from '@/components/nav-bar/nav-link-validator.vue';

    @Component({
        name: 'nav-container-quorum-set',
        components: {NavLinkValidator, NavLinkQuorumSet, AlertTriangleIcon},
    })
    export default class NavContainerQuorumSet extends Vue {
        @Prop()
        protected quorumSet!: QuorumSet;
        @Prop({default: 0})
        protected level!: number;
        @Prop({default: false})
        protected showIt!: boolean;

        protected showChildren: boolean = false;

meuh(){
    this.showChildren = !this.showChildren;
}
        get isRoot(): boolean {
            return this.level === 0;
        }

        get classObject(): any {
            return {
                'dropdown-menu': !this.isRoot,
                'dropdown-menu-arrow': !this.isRoot,
                'dropdown-menu-columns': !this.isRoot,
                'dropdown-menu-columns-2': !this.isRoot,
                'show': this.showChildren,
                'navbar-nav': this.isRoot,
                'pl-3': this.level === 1,
            };
        }

        get validatorClassObject(): any {
            return {
                'pl-3': this.level === 2
            };
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        get selectedNode() {
            return this.store.quorumMonitorStore.selectedNode;
        }

        get network(): Network {
            return this.$root.$data.store.network;
        }

        public isOrganizationSubQuorum(quorumSet: QuorumSet): boolean {
            if (quorumSet.validators.length === 0) {
                return false;
            }

            if (quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!)[0].organizationId === undefined) {
                return false;
            }

            return quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!).every((validator, index, validators) => validator.organizationId === validators[0].organizationId);
        }

        subQuorumOrganizationIsTierOne(quorumSet: QuorumSet): boolean {
            if (this.isOrganizationSubQuorum && quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!)[0].organizationId) {
                return this.network.getOrganizationById(quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!)[0].organizationId!)!.isTierOneOrganization;
            }

            return false;
        }

        public subQuorumOrganizationName(quorumSet: QuorumSet): string {
            if (!this.isOrganizationSubQuorum) {
                return '';
            }

            let organizationId = this.network.getNodeByPublicKey(quorumSet.validators[0])!.organizationId!;
            return this.network.getOrganizationById(organizationId)!.name;
        }
    };
</script>
<style scoped>

    .my-nav-link {
        padding-top: 5px !important;
        padding-bottom: 5px !important;
        height: 22px !important;
    }

</style>