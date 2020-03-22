<template>
    <div class="sb-nav-item" :class="classObject">
        <nav-link
                :title="title"
                v-on:click="toggleShow"
                :showDropdownToggle="true"
                :showIcon="isRoot"
                :show-sub-title="true"
                :sub-title="'with treshold ' + quorumSet.threshold"
                :icon="'fe-share-2'"
                :drop-down-showing="showing"
                :secondary="!isRoot"

        />
        <div v-if="showing" class="sb-nav-dropdown">
            <nav-link
                    v-for="validator in validators"
                    v-on:click="selectNode(validator)"
                    :title="getDisplayName(validator)"
                    :isLinkInDropdown="true"
            >
                <template v-slot:action-dropdown>
                    <node-action-bar :node="validator"/>
                </template>
            </nav-link>
            <quorum-set-dropdown v-for="(innerQuorumSet, index) in innerQuorumSets" :quorumSet="innerQuorumSet" :level="level+1" :key="index"/>
        </div>
    </div>
</template>

<script lang="ts">
    import {Component, Prop, Mixins} from 'vue-property-decorator';
    import {Network, Node, QuorumSet} from '@stellarbeat/js-stellar-domain';
    import NavLink from '@/components/side-bar/nav-link.vue';
    import {DropdownMixin} from '@/components/side-bar/network/dropdown-mixin';
    import NavPagination from '@/components/side-bar/nav-pagination.vue';
    import NodeActionBar from '@/components/quorum-monitor-deprecated/quorum-set-explorer/node-action-bar.vue';
    import Store from '@/store/Store';

    @Component({
        components: {
            NodeActionBar,
            NavPagination,
            NavLink
        },
    })
    export default class QuorumSetDropdown extends Mixins(DropdownMixin) {
        @Prop()
        quorumSet!:QuorumSet;

        @Prop({default: 0})
        protected level!: number;

        get classObject():any {
            return {
                'pl-3': this.level === 1,
                'pl-5': this.level === 2

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
            this.$router.push({
                name: 'node-dashboard',
                params: {publicKey: node.publicKey!},
                query: {'center': '1', 'no-scroll': '1'},
            });
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
    }
</script>

<style scoped>

</style>


