<template>
    <div class="card this-card">
        <div class="card-header">
            <h4 class="card-title">Latest organization updates</h4>
        </div>
        <div v-if="failed" class="card-alert alert alert-danger mb-0">
            <b-icon-exclamation-triangle/>
            Error fetching data
        </div>
        <div class="card-body py-0 overflow-auto">
            <b-list-group v-if="!isLoading" flush class="w-100 mb-4">
                <b-list-group-item v-for="updatesOnDate in updatesPerDate" :key="updatesOnDate.date.getTime()"
                                   class="px-0 pb-0">
                    <div class="d-flex justify-content-between flex-wrap">
                        <div class="w-75">
                            <div class="text-muted mb-1" style="font-size: small">{{new
                                Date(updatesOnDate.date).toLocaleString()}}
                            </div>
                            <div class="mb-2">
                                <div v-for="update in updatesOnDate.updates" :key="update.key">
                                    <div v-if="update.key === 'validators'">
                                        Validators updated
                                    </div>
                                    <div v-if="update.key === 'name'">
                                        Name changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'dba'">
                                        Dba changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'url'">
                                        Url changed to <a :href="update.value">{{update.value || 'empty'}}</a>
                                    </div>
                                    <div v-if="update.key === 'officialEmail'">
                                        Official email changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'phoneNumber'">
                                        Phone number changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'physicalAddress'">
                                        Physical address changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'twitter'">
                                        Twitter account changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'github'">
                                        Github account changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'keybase'">
                                        Keybase account changed to {{update.value || 'empty'}}
                                    </div>
                                    <div v-if="update.key === 'description'">
                                        Description changed to <p class="ml-2">"{{update.value || 'empty'}}"</p>
                                    </div>
                                    <div v-if="update.key === 'archival'">
                                        Organization unarchived after period of inactivity
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <b-button-toolbar>
                                <b-button-group size="sm">
                                    <b-button v-b-tooltip="'View diff'"
                                              v-on:click="showDiff(updatesOnDate.snapshot)">
                                        <b-icon-file-diff/>
                                    </b-button>
                                    <b-button v-on:click="timeTravel(updatesOnDate.snapshot)"
                                              v-b-tooltip="'Travel to this point in time'">
                                        <b-icon-clock/>
                                    </b-button>
                                </b-button-group>
                            </b-button-toolbar>
                        </div>
                    </div>
                </b-list-group-item>
                <b-list-group-item v-if="updatesPerDate.length === 0 && !isLoading">
                    No recent updates...
                </b-list-group-item>
            </b-list-group>
            <div v-else class="d-flex justify-content-center mt-5">
                <div class="loader"></div>
            </div>
        </div>
        <b-modal ref="modal-diff" title="Diff" size="lg">
            <div v-html="diffModalHtml"></div>
        </b-modal>
    </div>
</template>
<script lang="ts">
    import {Component, Prop} from 'vue-property-decorator';
    import Vue from 'vue';
    import {
        Network,
        Node,
        Organization,
        OrganizationSnapShot,
        PublicKey,
        QuorumSet
    } from '@stellarbeat/js-stellar-domain';
    import Store from '@/store/Store';
    import AsyncComputed from 'vue-async-computed-decorator';
    import {Delta, formatters, create, DiffPatcher} from 'jsondiffpatch';
    import 'jsondiffpatch/dist/formatters-styles/html.css';


    import {
        VBTooltip,
        BTable,
        BModal,
        VBModal,
        BButton,
        BBadge,
        BListGroup,
        BListGroupItem,
        BIconFileDiff,
        BButtonGroup,
        BIconClock,
        BButtonToolbar
    } from 'bootstrap-vue';

    interface Update {
        key: string;
        value: any;
    }

    @Component({
        components: {
            BTable, BModal, BButton, BListGroup, BListGroupItem, BBadge, BIconFileDiff,
            BButtonGroup,
            BIconClock,
            BButtonToolbar
        },
        directives: {'b-tooltip': VBTooltip, 'b-modal': VBModal}
    })
    export default class NodeLatestUpdates extends Vue {
        protected differ!: DiffPatcher;
        protected diffModalHtml: string = '<p>No update selected</p>';
        protected deltas: Map<string, Delta | undefined> = new Map();
        protected updatesPerDate: { date: string, updates: Update[], snapshot: any }[] = [];
        protected isLoading: boolean = true;
        protected failed: boolean = false;

        @Prop()
        protected organization!: Organization;

        showDiff(snapShot: any) {
            formatters.html.showUnchanged(true);
            this.diffModalHtml = formatters.html.format(this.deltas.get(snapShot.startDate)!, snapShot);
            (this.$refs['modal-diff'] as BModal).show();
        }

        get store(): Store {
            return this.$root.$data.store;
        }

        @AsyncComputed()
        async snapshots() {
            let snapshots: any = [];
            try {

                this.deltas = new Map();
                this.updatesPerDate = [];
                snapshots = await this.store.fetchOrganizationSnapshotsById(this.organization.id);
                snapshots = snapshots.map((snapshot: OrganizationSnapShot) =>{
                    return {
                        validators: snapshot.organization.validators.map(
                            (validator: PublicKey) => this.network.getNodeByPublicKey(validator) && this.network.getNodeByPublicKey(validator)!.name ? this.network.getNodeByPublicKey(validator)!.name : validator),
                        startDate: snapshot.startDate,
                        endDate: snapshot.endDate,
                        id: snapshot.organization.id,
                        name: snapshot.organization.name,
                        dba: snapshot.organization.dba,
                        url: snapshot.organization.url,
                        officialEmail: snapshot.organization.officialEmail,
                        phoneNumber: snapshot.organization.phoneNumber,
                        physicalAddress: snapshot.organization.physicalAddress,
                        twitter: snapshot.organization.twitter,
                        github: snapshot.organization.github,
                        description: snapshot.organization.description,
                        keybase: snapshot.organization.keybase
                    }
                });
                let validatorSort = (a: PublicKey, b: PublicKey) => a.localeCompare(b);
                for (let i = snapshots.length - 2; i >= 0; i--) {
                    let updates: Update[] = [];
                    ['validators', 'name', 'dba', 'url', 'officialEmail', 'phoneNumber', 'physicalAddress', 'twitter', 'github', 'description', 'keybase']
                        .filter(key => key === 'validators' ?
                            JSON.stringify(snapshots[i][key].sort(validatorSort)) !== JSON.stringify(snapshots[i + 1][key].sort(validatorSort))
                            : snapshots[i][key] !== snapshots[i + 1][key]
                        )
                        .forEach(changedKey => updates.push({key: changedKey, value: snapshots[i][changedKey]}));

                    if (snapshots[i]['startDate'].getTime() !== snapshots[i + 1]['endDate'].getTime()) {
                        updates.push({key: 'archival', value: 'unArchived'});
                    }
                    if (updates.length === 0) {
                        console.log(snapshots[i], snapshots[i + 1]);
                    }


                    this.updatesPerDate.push({date: snapshots[i].startDate, updates: updates, snapshot: snapshots[i]});

                    this.deltas.set(snapshots[i].startDate, this.differ.diff(snapshots[i + 1], snapshots[i]));
                }
                this.updatesPerDate.reverse();

            } catch (e) {
                this.failed = true;
                console.log(e);
            }

            this.isLoading = false;
            return snapshots;
        }

        async timeTravel(update: any) {
            this.store.isLoading = true;
            await this.store.fetchData(new Date(update.startDate));
            this.store.isLoading = false;
        }

        mounted() {
            this.differ = create({
                /*propertyFilter: function (name: string, context: any) {
                    return !['startDate', 'endDate'].includes(name);
                },*/
            });
        }

        get network(): Network {
            return this.store.network;
        }
    };
</script>

<style scoped>
    .changed {
        background: #5eba00;
    }

    .this-card {
        min-height: 200px;
        max-height: 910px;
    }
</style>
