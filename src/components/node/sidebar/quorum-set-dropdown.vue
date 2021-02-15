<template>
    <div class="sb-nav-item" :class="classObject">
        <nav-link
                :title="title"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :showIcon="isRoot"
                :show-sub-title="true"
                :sub-title="quorumSet.hasValidators() ? 'with threshold ' + quorumSet.threshold : 'not yet detected'"
                :drop-down-showing="showing"
                :secondary="!isRoot"
                :has-warnings="hasWarnings"
                :warnings="quorumSetWarnings"
                :has-danger="network.isQuorumSetBlocked(store.selectedNode, quorumSet)"
                :dangers="quorumSetDangers"
        >
            <template v-slot:action-dropdown>
                <quorum-set-actions
                        :level="level"
                        :quorum-set="quorumSet" :parentQuorumSet="parentQuorumSet"
                        v-on:expand="showing = true"
                />
            </template>
        </nav-link>
        <div v-show="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="validator in validators"
                    :key="validator.publicKey"
                    v-on:click="selectNode(validator)"
                    :title="getDisplayName(validator)"
                    :isLinkInDropdown="true"
                    :has-danger="network.isNodeFailing(validator)"
                    :dangers="'Node not validating ' + (network.isQuorumSetBlocked(validator) ? ': quorumset not reaching threshold' : '')"
                    :has-warnings="network.nodeHasWarnings(validator)"
                    warnings="History archive not up-to-date"
            >

                <template v-slot:action-dropdown>
                    <node-actions :node="validator" :supports-delete="true" :quorumSet="quorumSet"/>
                </template>
            </nav-link>
            <quorum-set-dropdown :parentQuorumSet="quorumSet" v-for="(innerQuorumSet, index) in innerQuorumSets" :quorumSet="innerQuorumSet" :level="level+1" :key="index" :expand="false"/>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Mixins, Watch} from 'vue-property-decorator';
    import {Node, Organization, QuorumSet, QuorumSetService} from '@stellarbeat/js-stellar-domain';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import {DropdownMixin} from '@/components/side-bar/dropdown-mixin';
    import NavPagination from '@/components/side-bar/nav-pagination.vue';
    import NodeActions from '@/components/node/sidebar/node-actions.vue';
    import QuorumSetActions from '@/components/node/sidebar/quorum-set-actions.vue';

    @Component({
        name: 'quorum-set-dropdown',
        components: {
            QuorumSetActions,
            NodeActions,
            NavPagination,
            NavLink
        },
    })
    export default class QuorumSetDropdown extends Mixins(DropdownMixin) {
        @Prop()
        quorumSet!:QuorumSet;

        @Prop({default: null})
        parentQuorumSet!:QuorumSet;

        @Prop({default: 0})
        protected level!: number;

        //checks one level of inner quorumsets
        get quorumSetHasFailingValidators(){
            return QuorumSetService.quorumSetHasFailingValidators(this.quorumSet, this.network);
        }

        get quorumSetDangers(){
           return QuorumSetService.getQuorumSetDangers(this.store.selectedNode!, this.quorumSet, this.network);
        }

        get quorumSetWarnings(){
            return QuorumSetService.getQuorumSetWarnings(this.quorumSet, this.network);
       }

        //checks one level of inner quorumSets
        get hasWarnings() {
            return QuorumSetService.quorumSetHasWarnings(this.quorumSet, this.network);
        }

        get classObject():any {
            return {
                'pl-3': this.level === 1,
                'pl-4': this.level === 2
            }
        }
        get title(): string {
            if(this.isOrganizationSubQuorum(this.quorumSet))
                return this.subQuorumOrganizationName(this.quorumSet);
            else return 'Quorum set';
        }
        get isRoot(): boolean {
            return this.level === 0;
        }

        get validators() {
            return this.quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator));
        }

        get innerQuorumSets() {
            return this.quorumSet.innerQuorumSets;
        }

        public selectNode(node: Node) {
            if(this.$route.params.publicKey && this.$route.params.publicKey === node.publicKey)
                return;

            this.$router.push({
                name: 'node-dashboard',
                params: {publicKey: node.publicKey!},
                query: {
                    'center': '1',
                    'no-scroll': '1',
                    'view': this.$route.query.view,
                    'network': this.$route.query.network,
                    'at': this.$route.query.at
                }
            })
        }

        public nodeState(node: Node) {
            return {
                inactive: !node.active,
                active: node.active,
                failing: this.network.isNodeFailing(node),
            };
        }

        getDisplayName(node:Node) {
            if(node.name)
                return node.name;

            return node.publicKey!.substr(0, 7) + '...' + node.publicKey!.substr(50, 100)
        }

        public isOrganizationSubQuorum(quorumSet: QuorumSet): boolean {
            if(this.isRoot)
                return false;

            if (quorumSet.validators.length === 0) {
                return false;
            }

            let organizationId = this.network.getNodeByPublicKey(quorumSet.validators[0])!.organizationId;
            if ( organizationId === undefined || this.network.getOrganizationById(organizationId) === undefined) {
                return false;
            }

            return quorumSet.validators.map(validator => this.network.getNodeByPublicKey(validator)!).every((validator, index, validators) => validator.organizationId === validators[0].organizationId);
        }

        public subQuorumOrganizationName(quorumSet: QuorumSet): string {
            if (!this.isOrganizationSubQuorum) {
                return '';
            }
            let organizationId = this.network.getNodeByPublicKey(quorumSet.validators[0])!.organizationId!;
            return this.network.getOrganizationById(organizationId)!.name;
        }
    }
</script>

<style scoped>

</style>


