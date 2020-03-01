<template>
    <a class="nav-link my-nav-link dropdown-toggle" href="#navbar-base"
       data-toggle="dropdown"
       role="button"
       aria-expanded="true"
       v-on:mouseover="hover = true"
       v-on:mouseleave="hover = false">
        <div class="mr-1 d-flex justify-content-between w-100">
            <span class="nav-link-title" :style="textStyleObject">
                {{text}}
            </span>
            <span v-if="!subQuorumOrganizationIsTierOne(quorumSet)" class="nav-link-icon">
                <alert-triangle-icon size="1x" style="color: orange"></alert-triangle-icon>
            </span>
        </div>
    </a>
</template>
<script lang="ts">
    import {Network, Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import Vue from 'vue';
    import {Component, Prop} from 'vue-property-decorator';
    import {AlertTriangleIcon} from 'vue-feather-icons';

    @Component({
        name: 'nav-link-quorum-set',
        components: {AlertTriangleIcon},
    })
    export default class NavLinkQuorumSet extends Vue {
        @Prop()
        protected quorumSet!: QuorumSet;

        protected hover:boolean = false;

        get store(): Store {
            return this.$root.$data.store;
        }

        get textStyleObject() {
            return {

            }
        }

        get text() {
            if(this.hover)
                return this.hoverText;
            else return this.normalText;
        }
        get normalText(){
            if(this.isOrganizationSubQuorum(this.quorumSet))
                return this.subQuorumOrganizationName(this.quorumSet);

            return `sub-quorumset`;
        }

        get hoverText() {
            return `${this.normalText.substring(0, 5)}... qset with threshold ${this.quorumSet.threshold}`;
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
            if (!this.isOrganizationSubQuorum(quorumSet))
                return false;

            if (quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!)[0].organizationId) {
                return this.network.getOrganizationById(quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!)[0].organizationId!)!.isTierOneOrganization;
            }

            return false;
        }

        public subQuorumOrganizationName(quorumSet: QuorumSet): string {
            if (!this.isOrganizationSubQuorum(quorumSet)) {
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