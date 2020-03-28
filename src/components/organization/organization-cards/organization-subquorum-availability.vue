<template>
    <div class="card">
        <div class="card-header">
            <h3 class="card-title">Subquorum Availability</h3>
        </div>
        <div class="card-body text-center">
            <h1 class="mb-2 mt-2"><span v-if="failAt > 1"
                                        class="badge sb-badge badge-success"
                                        v-b-tooltip.hover
                                        :title="'At least ' + failAt + ' validators have to fail to bring this subquorum down'"
            ><i class="fe fe-check-circle"></i>
                            </span>
                <span v-else-if="failAt === 1"
                      class="badge sb-badge badge-warning ml-1"
                      v-b-tooltip.hover title="If one more validator fails, this subquorum will fail"
                ><i class="fe fe-alert-circle"></i>
                            </span>
                <span v-else
                      class="badge sb-badge badge-danger ml-1"
                      v-b-tooltip.hover title="This subquorum is failing"
                >Failing
                            </span>
            </h1>
            <div class="list-group list-group-flush nested-tree px-4 pb-4">
                <!--div class="list-group-item p-1 pr-0">

                </div!-->
                <div class="list-group-item p-1 pr-0">
                    <b-progress height="1rem">
                        <b-progress-bar :value="organization.subQuorum24HoursAvailability"
                                        v-bind:variant="organization.subQuorum24HoursAvailability === 100 ? 'success ' : 'warning'">
                            24H availability: {{organization.subQuorum24HoursAvailability}}%
                        </b-progress-bar>
                    </b-progress>
                </div>
                <div class="list-group-item p-1 pr-0">
                    <b-progress height="1rem">
                        <b-progress-bar :value="organization.subQuorum30DaysAvailability"
                                        v-bind:variant="organization.subQuorum30DaysAvailability > 99.9 ? 'success ' : 'warning'">
                            30D availability: {{organization.subQuorum30DaysAvailability}}%
                        </b-progress-bar>
                    </b-progress>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
    export default {
        name: 'organization-subquorum-availability',
        props: {
            failAt: {},
            organization: {}
        }
    };
</script>